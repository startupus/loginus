import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UIElement } from './entities/ui-element.entity';
import { UIGroup } from './entities/ui-group.entity';
import { NavigationMenu } from './entities/navigation-menu.entity';
import { User } from '../../../users/entities/user.entity';
import { PermissionsUtilsService } from '../../../common/services/permissions-utils.service';
import { applyDefaultLabels, getDefaultMenuSeed, MenuItemConfig } from './default-menus';
import { PluginManagerService } from '../../../plugins/plugin-manager.service';
import { PluginsService } from '../../../plugins/plugins.service';
import { Plugin, PluginType } from '../../../plugins/entities/plugin.entity';
import { EventBusService } from '../../../core/events/event-bus.service';
import { MENU_EVENTS } from '../../../core/events/events';

@Injectable()
export class UIPermissionsService {
  constructor(
    @InjectRepository(UIElement)
    private uiElementsRepo: Repository<UIElement>,
    @InjectRepository(UIGroup)
    private uiGroupsRepo: Repository<UIGroup>,
    @InjectRepository(NavigationMenu)
    private navigationMenusRepo: Repository<NavigationMenu>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private permissionsUtils: PermissionsUtilsService,
    @Inject(forwardRef(() => PluginManagerService))
    private pluginManager: PluginManagerService | null,
    // Сервис реальных плагинов (таблица plugins)
    private readonly pluginsService: PluginsService,
    private readonly eventBus: EventBusService,
  ) {
    // Проверяем, что pluginManager доступен (может быть null при инициализации)
    if (!this.pluginManager) {
      console.warn('[UIPermissionsService] PluginManagerService not available during construction');
    }
  }

  /**
   * Получение UI элементов для пользователя
   */
  async getUIElementsForUser(userId: string): Promise<UIElement[]> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['userRoleAssignments', 'userRoleAssignments.role', 'userRoleAssignments.organizationRole', 'userRoleAssignments.teamRole'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const userRoles = user.userRoleAssignments?.map(assignment => {
      if (assignment.role) return assignment.role.name;
      if (assignment.organizationRole) return assignment.organizationRole.name;
      if (assignment.teamRole) return assignment.teamRole.name;
      return null;
    }).filter((name): name is string => Boolean(name)) || [];
    const userPermissions = this.permissionsUtils.extractUserPermissions(user);

    const allElements = await this.uiElementsRepo.find({
      where: { isActive: true },
      relations: ['group'],
      order: { priority: 'ASC' },
    });

    const userElements: UIElement[] = [];

    for (const element of allElements) {
      if (await this.canUserSeeElement(element, userRoles, userPermissions, user)) {
        userElements.push(element);
      }
    }

    return userElements;
  }

  /**
   * Получение навигационного меню для пользователя
   */
  async getNavigationMenuForUser(userId: string, menuId: string): Promise<NavigationMenu | null> {
    try {
      const user = await this.usersRepo.findOne({
        where: { id: userId },
        relations: ['userRoleAssignments', 'userRoleAssignments.role', 'userRoleAssignments.organizationRole', 'userRoleAssignments.teamRole'],
      });

      if (!user) {
        console.error('[UIPermissionsService] User not found:', userId);
        // Возвращаем дефолтное меню вместо ошибки
        const seed = getDefaultMenuSeed(menuId);
        if (seed) {
          return {
            id: seed.menuId,
            menuId: seed.menuId,
            name: seed.name,
            items: seed.items || [],
            conditions: seed.conditions || {},
            priority: seed.priority || 100,
            isActive: seed.isActive !== undefined ? seed.isActive : true,
            metadata: seed.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          } as NavigationMenu;
        }
        return null;
      }

      let menu = await this.ensureMenuExists(menuId, true);

      if (!menu) {
        console.warn('[UIPermissionsService] Menu not found, using seed');
        const seed = getDefaultMenuSeed(menuId);
        if (seed) {
          return {
            id: seed.menuId,
            menuId: seed.menuId,
            name: seed.name,
            items: seed.items || [],
            conditions: seed.conditions || {},
            priority: seed.priority || 100,
            isActive: seed.isActive !== undefined ? seed.isActive : true,
            metadata: seed.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          } as NavigationMenu;
        }
        return null;
      }

    // Объединяем системные пункты меню с плагинами из БД
    // Системные пункты (type: 'default') не должны теряться
    try {
      // Всегда получаем системные пункты из seed (они должны быть всегда)
      const seed = getDefaultMenuSeed(menuId);
      let systemItems: MenuItemConfig[] = [];
      
      if (seed && Array.isArray(seed.items)) {
        // Seed содержит только системные пункты (type: 'default')
        systemItems = [...seed.items];
        console.log('[UIPermissionsService] Loaded system items from seed:', systemItems.length);
      }
      
      // Также проверяем, есть ли системные пункты в существующем меню
      // (на случай, если они были изменены в админке)
      // НО: не перезаписываем системные пункты из seed, если они уже загружены
      // Потому что в меню могут быть только плагины
      if (systemItems.length === 0 && Array.isArray(menu.items)) {
        const existingSystemItems = menu.items.filter(item => item && item.type === 'default');
        // Если в меню есть системные пункты, используем их (они могут быть изменены)
        // Иначе используем из seed
        if (existingSystemItems.length > 0) {
          console.log('[UIPermissionsService] Found system items in existing menu:', existingSystemItems.length);
          systemItems = existingSystemItems as MenuItemConfig[];
        }
      }
      
      // Загружаем плагины из БД
      let pluginItems: MenuItemConfig[] = [];
      try {
        const dbPlugins = await this.pluginsService.findAll();
        const pluginsForMenu = dbPlugins.filter(p => p.menuId === menuId);
        
        pluginItems = pluginsForMenu
          .map(plugin => {
            try {
              return this.convertPluginToMenuItem(plugin);
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.warn(`[UIPermissionsService] Failed to convert plugin ${plugin.id}:`, error);
              }
              return null;
            }
          })
          .filter((item): item is MenuItemConfig => item !== null);
      } catch (pluginsError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[UIPermissionsService] Failed to load plugins:', pluginsError);
        }
        // Продолжаем работу без плагинов
      }
      
      // Объединяем системные пункты и плагины
      const allItems = [...systemItems, ...pluginItems];
      
      console.log('[UIPermissionsService] System items count:', systemItems.length);
      console.log('[UIPermissionsService] Plugin items count:', pluginItems.length);
      if (systemItems.length > 0) {
        console.log('[UIPermissionsService] System items:', systemItems.map(item => ({ id: item.id, type: item.type })));
      }
      if (pluginItems.length > 0) {
        console.log('[UIPermissionsService] Plugin items:', pluginItems.map(item => ({ id: item.id, type: item.type })));
      }
      
      if (allItems.length > 0) {
        // Сортируем по order
        const sortedItems = allItems
          .filter(item => item && item.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        console.log('[UIPermissionsService] Merged items count:', sortedItems.length);
        console.log('[UIPermissionsService] Merged items:', sortedItems.map(item => ({ id: item.id, type: item.type, order: item.order })));
        
        // Обновляем меню с объединенной структурой
        menu.items = sortedItems;
        try {
          menu = await this.navigationMenusRepo.save(menu);
        } catch (saveError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[UIPermissionsService] Failed to save menu:', saveError);
          }
          // В случае ошибки сохранения используем существующее меню
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[UIPermissionsService] No items to merge, using existing menu');
        }
      }
    } catch (error) {
      // В случае ошибки используем существующее меню
      if (process.env.NODE_ENV === 'development') {
        console.error('[UIPermissionsService] Failed to merge plugins with system items:', error);
      }
      // Если меню пустое, пытаемся загрузить из seed
      if (!menu.items || (Array.isArray(menu.items) && menu.items.length === 0)) {
        try {
          const seed = getDefaultMenuSeed(menuId);
          if (seed) {
            menu.items = seed.items;
            menu = await this.navigationMenusRepo.save(menu);
          }
        } catch (seedError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[UIPermissionsService] Failed to load seed menu:', seedError);
          }
        }
      }
    }

    const userRoles = user.userRoleAssignments?.map(assignment => {
      if (assignment.role) return assignment.role.name;
      if (assignment.organizationRole) return assignment.organizationRole.name;
      if (assignment.teamRole) return assignment.teamRole.name;
      return null;
    }).filter((name): name is string => Boolean(name)) || [];
    const userPermissions = this.permissionsUtils.extractUserPermissions(user);

    // Рекурсивно фильтруем элементы меню по флагу enabled и правам пользователя
    const filterItems = async (items: any[]): Promise<any[]> => {
      const result: any[] = [];

      for (const item of items || []) {
        if (!item) continue;

        // Явно отключённые пункты меню (enabled === false) не показываем
        if (item.enabled === false) {
          continue;
        }

        // Сначала фильтруем дочерние элементы
        let children = item.children;
        if (Array.isArray(children) && children.length > 0) {
          children = await filterItems(children);
        }

        // Проверяем, может ли пользователь видеть пункт меню
        const canSee = await this.canUserSeeMenuItem(
          item,
          userRoles,
          userPermissions,
          user,
        );
        if (!canSee) {
          continue;
        }

        result.push({
          ...item,
          children,
        });
      }

      return result;
    };

    const filteredItems = await filterItems(menu.items || []);
    
    console.log('[UIPermissionsService] After filtering - items count:', filteredItems.length);
    console.log('[UIPermissionsService] After filtering - items:', filteredItems.map(item => ({ id: item.id, type: item.type, enabled: item.enabled })));

    return {
      ...menu,
      items: filteredItems,
    };
    } catch (error) {
      console.error('[UIPermissionsService] getNavigationMenuForUser - Global error:', error);
      console.error('[UIPermissionsService] Error details:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error && error.stack) {
        console.error('[UIPermissionsService] Stack:', error.stack);
      }
      // В случае любой ошибки возвращаем дефолтное меню из seed
      try {
        const seed = getDefaultMenuSeed(menuId);
        if (seed) {
          return {
            id: seed.menuId,
            menuId: seed.menuId,
            name: seed.name,
            items: seed.items || [],
            conditions: seed.conditions || {},
            priority: seed.priority || 100,
            isActive: seed.isActive !== undefined ? seed.isActive : true,
            metadata: seed.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
          } as NavigationMenu;
        }
      } catch (seedError) {
        console.error('[UIPermissionsService] Failed to load seed menu in error handler:', seedError);
      }
      // В крайнем случае возвращаем null
      return null;
    }
  }

  /**
   * Получить сырую конфигурацию меню (для админки настроек меню).
   * Не фильтрует пункты по правам.
   * Использует плагины для получения пунктов меню.
   */
  async getNavigationMenuConfig(menuId: string): Promise<NavigationMenu | null> {
    // КРИТИЧНО: Загружаем меню БЕЗ автоматического сохранения
    // ensureMenuExists больше не сохраняет меню при чтении
    let menu = await this.ensureMenuExists(menuId);
    
    if (!menu) {
      return null;
    }

    // Логируем что загрузили из БД
    if (process.env.NODE_ENV === 'development') {
      const loadedItems = (menu.items as MenuItemConfig[] | undefined) || [];
      console.log('[UIPermissionsService] getNavigationMenuConfig - loaded items count:', loadedItems.length);
      console.log('[UIPermissionsService] getNavigationMenuConfig - loaded items IDs:', loadedItems.map(item => item.id));
      console.log('[UIPermissionsService] getNavigationMenuConfig - items with children:', loadedItems
        .filter(item => item.children && item.children.length > 0)
        .map(item => ({ id: item.id, childrenCount: item.children?.length })));
    }

    // ✅ Emit BEFORE_RENDER event
    await this.eventBus.emit(MENU_EVENTS.BEFORE_RENDER, {
      menuId,
      items: menu.items,
    });

    // ВАЖНО: Используем ТОЛЬКО данные из БД, НЕ добавляем плагины автоматически
    // Плагины инициализируют меню только при первом запуске (когда меню пустое)
    // После этого админ полностью контролирует структуру меню через админ-панель
    
    // Проверяем, что pluginManager доступен (может быть не инициализирован при первом вызове)
    if (this.pluginManager && typeof this.pluginManager.isInitialized === 'function' && this.pluginManager.isInitialized()) {
      try {
        // ТОЛЬКО если меню в БД полностью пустое, инициализируем его плагинами
        // Это происходит только при первом запуске системы
        const menuItemsCount = Array.isArray(menu.items) ? menu.items.length : 0;
        if (menuItemsCount === 0) {
          const pluginItems = this.pluginManager.getMenuItemsFromPlugins() || [];
          if (pluginItems.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[UIPermissionsService] Initializing empty menu with plugins:', pluginItems.length);
            }
            menu.items = pluginItems;
            menu = await this.navigationMenusRepo.save(menu);
          }
        } else {
          // Меню уже настроено в админке - используем ТОЛЬКО данные из БД
          // НЕ добавляем плагины, НЕ восстанавливаем удаленные пункты
          // КРИТИЧНО: Если меню не пустое, НИКОГДА не добавляем плагины автоматически
          if (process.env.NODE_ENV === 'development') {
            console.log('[UIPermissionsService] Menu already configured, using DB data only. Items count:', menuItemsCount);
            console.log('[UIPermissionsService] Menu items IDs:', (menu.items as MenuItemConfig[]).map(item => item.id));
          }
        }
        
        // Синхронизируем состояние плагинов с данными из БД (опционально, для совместимости)
        // Это НЕ влияет на структуру меню, только на состояние плагинов
        const dbItems = menu.items as MenuItemConfig[];
        for (const item of dbItems) {
          try {
            this.pluginManager.updatePluginFromMenuItem(item);
          } catch (error) {
            // Игнорируем ошибки при обновлении плагинов (плагин может не существовать)
            // Это нормально для кастомных пунктов меню
          }
        }
      } catch (error) {
        // Если плагины еще не инициализированы, используем данные из БД
        if (process.env.NODE_ENV === 'development') {
          console.warn('[UIPermissionsService] PluginManager error, using DB data:', error);
        }
      }
    }

    // Применяем дефолтные метки ТОЛЬКО для отображения (не сохраняем в БД)
    // ВАЖНО: applyDefaultLabels использует spread оператор, так что все поля (включая path) должны сохраняться
    const originalItems = (menu.items as MenuItemConfig[] | undefined) || [];
    
    // Рекурсивно применяем дефолтные метки, сохраняя структуру children
    const enrichWithDefaults = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items.map(item => {
        const enriched = applyDefaultLabels([item])[0];
        // КРИТИЧНО: Сохраняем children из оригинала, не применяем applyDefaultLabels к ним
        // чтобы не изменить структуру вложенности
        if (item.children && item.children.length > 0) {
          enriched.children = enrichWithDefaults(item.children);
        }
        return enriched;
      });
    };
    
    const enrichedItems = enrichWithDefaults(originalItems);
    
    // Логируем для диагностики
    if (process.env.NODE_ENV === 'development') {
      const originalWithPaths = originalItems.filter(item => item.path);
      const enrichedWithPaths = enrichedItems.filter(item => item.path);
      const originalWithChildren = originalItems.filter(item => item.children && item.children.length > 0);
      const enrichedWithChildren = enrichedItems.filter(item => item.children && item.children.length > 0);
      console.log('[UIPermissionsService] Loaded menu items:', {
        originalCount: originalItems.length,
        enrichedCount: enrichedItems.length,
        originalWithPaths: originalWithPaths.length,
        enrichedWithPaths: enrichedWithPaths.length,
        originalWithChildren: originalWithChildren.length,
        enrichedWithChildren: enrichedWithChildren.length,
        preserved: originalItems.length === enrichedItems.length && originalWithChildren.length === enrichedWithChildren.length,
      });
    }
    
    menu.items = enrichedItems;

    // ✅ Emit AFTER_RENDER event
    await this.eventBus.emit(MENU_EVENTS.AFTER_RENDER, {
      menuId,
      items: menu.items,
    });

    return menu;
  }

  /**
   * Обновить конфигурацию меню (для админки настроек меню).
   * Требует прав super_admin.
   * Обновляет плагины на основе изменений в меню.
   */
  async updateNavigationMenuConfig(
    menuId: string,
    items: any[],
    userId: string,
  ): Promise<NavigationMenu> {
    await this.checkSuperAdminAccess(userId);

    let menu = await this.ensureMenuExists(menuId, false);
    if (!menu) {
      menu = this.navigationMenusRepo.create({
        menuId,
        name: menuId,
        items,
        conditions: {},
        priority: 100,
        isActive: true,
        metadata: {},
      });
    } else {
      menu.items = items;
    }

    // Обновляем плагины на основе изменений в меню (если pluginManager доступен)
    if (this.pluginManager) {
      try {
        const menuItems = items as MenuItemConfig[];
        for (const item of menuItems) {
          try {
            this.pluginManager.updatePluginFromMenuItem(item);
          } catch (error) {
            // Игнорируем ошибки при обновлении плагинов
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[UIPermissionsService] Failed to update plugin for menu item ${item.id}:`, error);
            }
          }
        }
      } catch (error) {
        // Игнорируем ошибки при работе с плагинами
        if (process.env.NODE_ENV === 'development') {
          console.warn('[UIPermissionsService] Failed to update plugins:', error);
        }
      }
    }

    // КРИТИЧНО: НЕ применяем applyDefaultLabels при сохранении!
    // Сохраняем ТОЧНО то, что пришло от админа, без изменений
    // applyDefaultLabels применяется только при чтении для отображения
    
    // Рекурсивно очищаем undefined значения и сохраняем структуру как есть
    const cleanItem = (item: any): MenuItemConfig => {
      const clean: any = {};
      Object.keys(item).forEach(key => {
        const value = item[key];
        if (value !== undefined && value !== null) {
          if (key === 'children' && Array.isArray(value)) {
            // Рекурсивно очищаем children, сохраняя структуру
            clean[key] = value.map(cleanItem);
          } else {
            clean[key] = value;
          }
        }
      });
      return clean as MenuItemConfig;
    };
    
    const cleanItems = (items as MenuItemConfig[]).map(cleanItem);
    
    // Логируем что именно сохраняем в БД
    if (process.env.NODE_ENV === 'development') {
      console.log('[UIPermissionsService] Saving to DB - items count:', cleanItems.length);
      console.log('[UIPermissionsService] Items IDs to save:', cleanItems.map(item => item.id));
      console.log('[UIPermissionsService] Items with children:', cleanItems
        .filter(item => item.children && item.children.length > 0)
        .map(item => ({ id: item.id, childrenCount: item.children?.length, childrenIds: item.children?.map(c => c.id) })));
      console.log('[UIPermissionsService] Full items structure to save:', JSON.stringify(cleanItems, null, 2));
    }
    
    // Логируем что именно сохраняем в БД
    if (process.env.NODE_ENV === 'development') {
      console.log('[UIPermissionsService] Saving to DB - items count:', cleanItems.length);
      console.log('[UIPermissionsService] Items IDs to save:', cleanItems.map(item => item.id));
      console.log('[UIPermissionsService] Items with children:', cleanItems
        .filter(item => item.children && item.children.length > 0)
        .map(item => ({ id: item.id, childrenCount: item.children?.length })));
      console.log('[UIPermissionsService] Full items structure to save:', JSON.stringify(cleanItems, null, 2));
    }
    
    // КРИТИЧНО: Сохраняем ТОЧНО то, что пришло от админа, без добавления плагинов
    menu.items = cleanItems;
    
    // Сохраняем в БД
    const savedMenu = await this.navigationMenusRepo.save(menu);
    
    // Проверяем, что данные сохранились правильно
    if (process.env.NODE_ENV === 'development') {
      const savedItems = savedMenu.items as MenuItemConfig[];
      console.log('[UIPermissionsService] ✅ After DB save - items count:', savedItems.length);
      console.log('[UIPermissionsService] ✅ After DB save - items IDs:', savedItems.map(item => item.id));
      console.log('[UIPermissionsService] ✅ After DB save - items with children:', savedItems
        .filter(item => item.children && item.children.length > 0)
        .map(item => ({ id: item.id, childrenCount: item.children?.length, childrenIds: item.children?.map(c => c.id) })));
      
      // Проверяем, что структура сохранилась
      const beforeCount = cleanItems.length;
      const afterCount = savedItems.length;
      const beforeWithChildren = cleanItems.filter(item => item.children && item.children.length > 0).length;
      const afterWithChildren = savedItems.filter(item => item.children && item.children.length > 0).length;
      
      if (beforeCount !== afterCount || beforeWithChildren !== afterWithChildren) {
        console.error('[UIPermissionsService] ❌ STRUCTURE LOST DURING DB SAVE!', {
          before: { count: beforeCount, withChildren: beforeWithChildren },
          after: { count: afterCount, withChildren: afterWithChildren },
        });
      } else {
        console.log('[UIPermissionsService] ✅ Structure preserved during DB save');
      }
      
      // Проверяем напрямую через повторную загрузку
      try {
        const reloadedMenu = await this.navigationMenusRepo.findOne({ 
          where: { menuId } 
        });
        
        if (reloadedMenu && reloadedMenu.items) {
          const rawItems = reloadedMenu.items as MenuItemConfig[];
          console.log('[UIPermissionsService] ✅ Reloaded from DB - items count:', rawItems.length);
          console.log('[UIPermissionsService] ✅ Reloaded from DB - items IDs:', rawItems.map(item => item.id));
          console.log('[UIPermissionsService] ✅ Reloaded from DB - items with children:', rawItems
            .filter(item => item.children && item.children.length > 0)
            .map(item => ({ id: item.id, childrenCount: item.children?.length })));
        }
      } catch (error) {
        console.warn('[UIPermissionsService] Failed to reload DB data:', error);
      }
    }

    // Синхронизируем реальные плагины с пунктами меню.
    // Каждый пункт с type: external | iframe | embedded должен иметь запись в таблице plugins.
    try {
      const menuItems = cleanItems as MenuItemConfig[];
      for (const item of menuItems) {
        await this.syncPluginFromMenuItem(menuId, item);
      }
    } catch (error) {
      // Ошибки синхронизации плагинов не должны ломать сохранение меню
      if (process.env.NODE_ENV === 'development') {
        console.warn('[UIPermissionsService] Failed to sync plugins from menu items:', error);
      }
    }

    // ✅ Emit STRUCTURE_CHANGED event
    await this.eventBus.emit(MENU_EVENTS.STRUCTURE_CHANGED, {
      menuId,
      items: savedMenu.items,
      userId,
    });

    return savedMenu;
  }

  /**
   * Создание UI элемента (только для super_admin)
   */
  async createUIElement(
    elementData: Partial<UIElement>,
    userId: string,
  ): Promise<UIElement> {
    await this.checkSuperAdminAccess(userId);

    const element = this.uiElementsRepo.create(elementData);
    return this.uiElementsRepo.save(element);
  }

  /**
   * Обновление UI элемента (только для super_admin)
   */
  async updateUIElement(
    elementId: string,
    updateData: Partial<UIElement>,
    userId: string,
  ): Promise<UIElement> {
    await this.checkSuperAdminAccess(userId);

    const element = await this.uiElementsRepo.findOne({
      where: { elementId },
    });

    if (!element) {
      throw new NotFoundException('UI элемент не найден');
    }

    Object.assign(element, updateData);
    return this.uiElementsRepo.save(element);
  }

  /**
   * Удаление UI элемента (только для super_admin)
   */
  async deleteUIElement(elementId: string, userId: string): Promise<void> {
    await this.checkSuperAdminAccess(userId);

    const element = await this.uiElementsRepo.findOne({
      where: { elementId },
    });

    if (!element) {
      throw new NotFoundException('UI элемент не найден');
    }

    await this.uiElementsRepo.remove(element);
  }

  /**
   * Проверка, может ли пользователь видеть элемент
   */
  private async canUserSeeElement(
    element: UIElement,
    userRoles: string[],
    userPermissions: string[],
    user: User,
  ): Promise<boolean> {
    // Проверяем права доступа
    if (element.requiredPermissions.length > 0) {
      const hasPermission = element.requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );
      if (!hasPermission) return false;
    }

    // Проверяем роли
    if (element.requiredRoles.length > 0) {
      const hasRole = element.requiredRoles.some(role =>
        userRoles.includes(role)
      );
      if (!hasRole) return false;
    }

    // Проверяем условия
    if (element.conditions && Object.keys(element.conditions).length > 0) {
      if (!await this.checkUIConditions(element.conditions, userRoles, userPermissions, user)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Проверка, может ли пользователь видеть элемент меню
   */
  private async canUserSeeMenuItem(
    item: any,
    userRoles: string[],
    userPermissions: string[],
    user: User,
  ): Promise<boolean> {
    // Проверяем права доступа
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      const hasPermission = item.requiredPermissions.some((permission: string) =>
        userPermissions.includes(permission)
      );
      if (!hasPermission) return false;
    }

    // Проверяем роли
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      const hasRole = item.requiredRoles.some((role: string) =>
        userRoles.includes(role)
      );
      if (!hasRole) return false;
    }

    // Проверяем условия
    if (item.conditions && Object.keys(item.conditions).length > 0) {
      if (!await this.checkUIConditions(item.conditions, userRoles, userPermissions, user)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Проверка условий UI элемента
   */
  private async checkUIConditions(
    conditions: Record<string, any>,
    userRoles: string[],
    userPermissions: string[],
    user: User,
  ): Promise<boolean> {
    // Проверяем включенность функции
    if (conditions.featureEnabled) {
      // Здесь должна быть проверка через FeatureSettings
      // Пока возвращаем true
    }

    // Проверяем роль пользователя
    if (conditions.userHasRole) {
      if (!userRoles.includes(conditions.userHasRole)) return false;
    }

    // Проверяем право пользователя
    if (conditions.userHasPermission) {
      if (!userPermissions.includes(conditions.userHasPermission)) return false;
    }

    // Проверяем организацию
    if (conditions.userInOrganization !== undefined) {
      const hasOrganization = !!(user.organizations && user.organizations.length > 0);
      if (hasOrganization !== conditions.userInOrganization) return false;
    }

    // Проверяем команду
    if (conditions.userInTeam !== undefined) {
      const hasTeam = !!(user.teams && user.teams.length > 0);
      if (hasTeam !== conditions.userInTeam) return false;
    }

    return true;
  }

  /**
   * Извлечение прав пользователя
   */

  /**
   * Проверка прав super_admin
   */
  private async checkSuperAdminAccess(userId: string): Promise<void> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['userRoleAssignments', 'userRoleAssignments.role'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const hasSuperAdminRole = user.userRoleAssignments?.some(
      assignment => assignment.role?.name === 'super_admin'
    );

    if (!hasSuperAdminRole) {
      throw new ForbiddenException('Только super_admin может управлять UI элементами');
    }
  }

  private async ensureMenuExists(menuId: string, onlyActive = false): Promise<NavigationMenu | null> {
    try {
      const where: any = { menuId };
      if (onlyActive) {
        where.isActive = true;
      }

      let menu = await this.navigationMenusRepo.findOne({ where });

      // Логируем что загрузили из БД
      if (menu && process.env.NODE_ENV === 'development') {
        const loadedItems = (menu.items as MenuItemConfig[] | undefined) || [];
        const loadedWithPaths = loadedItems.filter(item => item && item.path);
        console.log('[UIPermissionsService] Loaded from DB - items with paths:', loadedWithPaths.map(item => ({ id: item.id, path: item.path, type: item.type })));
        console.log('[UIPermissionsService] Full items from DB (raw):', JSON.stringify(loadedItems, null, 2));
      }

      if (!menu) {
        // Пытаемся получить дефолтное меню из seed
        const seed = getDefaultMenuSeed(menuId);
        
        // Если seed нет, пытаемся использовать плагины (если они доступны и инициализированы)
        let pluginItems: MenuItemConfig[] = [];
        if (!seed && this.pluginManager && typeof this.pluginManager.isInitialized === 'function' && this.pluginManager.isInitialized()) {
          try {
            pluginItems = this.pluginManager.getMenuItemsFromPlugins();
          } catch (error) {
            // Если плагины еще не инициализированы, используем пустой массив
            if (process.env.NODE_ENV === 'development') {
              console.warn('[UIPermissionsService] PluginManager error, using seed data:', error);
            }
          }
        }
        
        // Если нет ни seed, ни плагинов, возвращаем null
        if (!seed && pluginItems.length === 0) {
          return null;
        }

        menu = this.navigationMenusRepo.create({
          menuId,
          name: seed?.name || menuId,
          items: seed ? seed.items : pluginItems,
          conditions: seed?.conditions || {},
          priority: seed?.priority || 100,
          isActive: seed?.isActive !== false,
          metadata: seed?.metadata || {},
        });
        menu = await this.navigationMenusRepo.save(menu);
      }
      // КРИТИЧНО: НЕ применяем applyDefaultLabels и НЕ сохраняем меню здесь
      // Это может перезаписать изменения пользователя
      // applyDefaultLabels применяется только при чтении в getNavigationMenuConfig
      // При сохранении через updateNavigationMenuConfig данные сохраняются как есть

      return menu;
    } catch (error) {
      console.error('[UIPermissionsService] Error in ensureMenuExists:', error);
      // Возвращаем null вместо того, чтобы падать с ошибкой
      return null;
    }
  }

  /**
   * Создать или обновить реальный Plugin на основе пункта меню.
   * Используется при сохранении настроек меню в админке.
   */
  private async syncPluginFromMenuItem(
    menuId: string,
    item: MenuItemConfig,
  ): Promise<void> {
    // Интересуют только кастомные типы
    if (item.type !== 'external' && item.type !== 'iframe' && item.type !== 'embedded') {
      return;
    }

    const slug = item.id;
    const basePayload = {
      slug,
      name: item.label || item.labelRu || item.labelEn || slug,
      description: undefined,
      icon: item.icon,
      enabled: item.enabled !== false,
      order: item.order ?? 0,
      scope: 'global',
      allowedRoles: (item as any).requiredRoles || [],
      requiredPermissions: (item as any).requiredPermissions || [],
      menuId,
      menuItemId: item.id,
      menuParentItemId: undefined as string | undefined,
    };

    // Типоспецифичная конфигурация
    if (item.type === 'external') {
      const config = {
        url: item.externalUrl || null,
        openIn: item.openInNewTab ? 'new_tab' : 'same_tab',
      };
      await this.upsertPluginFromMenuItem(slug, {
        ...basePayload,
        type: PluginType.EXTERNAL_LINK,
        config,
      });
    } else if (item.type === 'iframe') {
      const config = {
        url: item.iframeUrl || null,
        iframeCode: item.iframeCode || null,
        path: item.path || null, // Сохраняем path в config
      };
      await this.upsertPluginFromMenuItem(slug, {
        ...basePayload,
        type: PluginType.IFRAME,
        config,
      });
    } else if (item.type === 'embedded') {
      const config = {
        entryUrl: item.embeddedAppUrl || null,
        launchMode: 'remote_url',
        path: item.path || null, // Сохраняем path в config
      };
      await this.upsertPluginFromMenuItem(slug, {
        ...basePayload,
        type: PluginType.WEB_APP,
        config,
      });
    }
  }

  /**
   * Вспомогательный метод: создать или обновить Plugin по slug.
   */
  private async upsertPluginFromMenuItem(
    slug: string,
    payload: {
      slug: string;
      name: string;
      description?: string;
      icon?: string;
      enabled: boolean;
      order: number;
      scope: string;
      allowedRoles: string[];
      requiredPermissions: string[];
      config: Record<string, any>;
      menuId: string;
      menuItemId: string;
      menuParentItemId?: string;
      type: PluginType;
    },
  ): Promise<void> {
    try {
      const existing = await this.pluginsService.findOneByIdOrSlug(slug);
      await this.pluginsService.update(existing.id, {
        name: payload.name,
        description: payload.description,
        icon: payload.icon,
        enabled: payload.enabled,
        order: payload.order,
        scope: payload.scope,
        allowedRoles: payload.allowedRoles,
        requiredPermissions: payload.requiredPermissions,
        config: payload.config,
        menuId: payload.menuId,
        menuItemId: payload.menuItemId,
        menuParentItemId: payload.menuParentItemId,
        type: payload.type,
      });
    } catch (error) {
      // Если плагин не найден — создаём новый
      if (
        error &&
        typeof error === 'object' &&
        (error as any).status === 404
      ) {
        await this.pluginsService.create({
          ...payload,
        } as any);
      } else {
        throw error;
      }
    }
  }

  /**
   * Преобразовать Plugin из БД в MenuItemConfig.
   * Извлекает iframeCode и другие поля из config.
   */
  private convertPluginToMenuItem(plugin: Plugin): MenuItemConfig {
    const baseItem: MenuItemConfig = {
      id: plugin.slug || plugin.id,
      type: this.mapPluginTypeToMenuItemType(plugin.type),
      enabled: plugin.enabled,
      order: plugin.order,
      label: plugin.name,
      icon: plugin.icon || undefined,
    };

    // Извлекаем типоспецифичные поля из config
    if (plugin.type === PluginType.IFRAME) {
      const config = plugin.config || {};
      baseItem.iframeUrl = config.url || undefined;
      baseItem.iframeCode = config.iframeCode || undefined;
      baseItem.path = config.path || undefined;
    } else if (plugin.type === PluginType.EXTERNAL_LINK) {
      const config = plugin.config || {};
      baseItem.externalUrl = config.url || undefined;
      baseItem.openInNewTab = config.openIn === 'new_tab';
    } else if (plugin.type === PluginType.WEB_APP) {
      const config = plugin.config || {};
      baseItem.embeddedAppUrl = config.entryUrl || undefined;
      baseItem.path = config.path || undefined; // Читаем path из config
    }

    return baseItem;
  }

  /**
   * Преобразовать PluginType в тип MenuItemConfig.
   */
  private mapPluginTypeToMenuItemType(pluginType: PluginType): 'default' | 'external' | 'iframe' | 'embedded' {
    switch (pluginType) {
      case PluginType.EXTERNAL_LINK:
        return 'external';
      case PluginType.IFRAME:
        return 'iframe';
      case PluginType.WEB_APP:
        return 'embedded';
      default:
        return 'default';
    }
  }
}
