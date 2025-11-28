import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IMenuPlugin, MenuPluginMetadata } from './interfaces/menu-plugin.interface';
import { BaseMenuPlugin } from './base/base-menu-plugin';
import { MenuItemConfig } from '../settings/micro-modules/ui-permissions/default-menus';

/**
 * Менеджер плагинов меню
 * Управляет регистрацией, включением/выключением и порядком плагинов
 * Похож на систему плагинов в Joomla
 */
@Injectable()
export class PluginManagerService implements OnModuleInit {
  private readonly logger = new Logger(PluginManagerService.name);
  private plugins: Map<string, IMenuPlugin> = new Map();
  private pluginsByParent: Map<string, IMenuPlugin[]> = new Map();
  private initialized = false;

  async onModuleInit() {
    // Плагины будут зарегистрированы через registerPlugin в PluginsModule
    // Флаг initialized будет установлен после регистрации всех плагинов
  }

  /**
   * Установить флаг инициализации (вызывается из PluginsModule после регистрации всех плагинов)
   */
  setInitialized(): void {
    this.initialized = true;
    this.logger.log('PluginManagerService initialized');
  }

  /**
   * Проверка, инициализирован ли менеджер плагинов
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Регистрация плагина
   */
  registerPlugin(plugin: IMenuPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Плагин с ID "${plugin.id}" уже зарегистрирован`);
    }

    this.plugins.set(plugin.id, plugin);

    // Добавляем в группу по родителю
    const parentId = plugin.parentId || 'root';
    if (!this.pluginsByParent.has(parentId)) {
      this.pluginsByParent.set(parentId, []);
    }
    this.pluginsByParent.get(parentId)!.push(plugin);

    // Инициализируем плагин (если метод асинхронный, вызываем без await)
    if (plugin.onInit) {
      try {
        const result = plugin.onInit();
        // Если метод возвращает Promise, обрабатываем его
        if (result instanceof Promise) {
          result.catch((error) => {
            this.logger.error(`Failed to initialize plugin ${plugin.id}:`, error);
          });
        }
      } catch (error) {
        this.logger.error(`Failed to initialize plugin ${plugin.id}:`, error);
      }
    }
  }

  /**
   * Регистрация плагина из метаданных
   */
  registerPluginFromMetadata(metadata: MenuPluginMetadata): IMenuPlugin {
    const plugin = new BaseMenuPlugin(metadata);
    this.registerPlugin(plugin);
    return plugin;
  }

  /**
   * Получить плагин по ID
   */
  getPlugin(id: string): IMenuPlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Получить все плагины
   */
  getAllPlugins(): IMenuPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Получить все включенные плагины
   */
  getEnabledPlugins(): IMenuPlugin[] {
    return this.getAllPlugins().filter((plugin) => plugin.enabled);
  }

  /**
   * Получить плагины по типу
   */
  getPluginsByType(type: 'system' | 'custom'): IMenuPlugin[] {
    return this.getAllPlugins().filter((plugin) => plugin.type === type);
  }

  /**
   * Получить дочерние плагины
   */
  getChildPlugins(parentId: string): IMenuPlugin[] {
    return this.pluginsByParent.get(parentId) || [];
  }

  /**
   * Включить плагин
   */
  async enablePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Плагин с ID "${id}" не найден`);
    }

    if (plugin.onEnable) {
      await plugin.onEnable();
    } else {
      plugin.enabled = true;
      plugin.menuItem.enabled = true;
    }
  }

  /**
   * Выключить плагин
   */
  async disablePlugin(id: string): Promise<void> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Плагин с ID "${id}" не найден`);
    }

    if (plugin.onDisable) {
      await plugin.onDisable();
    } else {
      plugin.enabled = false;
      plugin.menuItem.enabled = false;
    }
  }

  /**
   * Установить порядок плагина
   */
  setPluginOrder(id: string, order: number): void {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Плагин с ID "${id}" не найден`);
    }

    plugin.order = order;
    plugin.menuItem.order = order;
  }

  /**
   * Установить родительский плагин
   */
  setPluginParent(id: string, parentId: string | undefined): void {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Плагин с ID "${id}" не найден`);
    }

    // Удаляем из старой группы
    const oldParentId = plugin.parentId || 'root';
    const oldGroup = this.pluginsByParent.get(oldParentId);
    if (oldGroup) {
      const index = oldGroup.findIndex((p) => p.id === id);
      if (index !== -1) {
        oldGroup.splice(index, 1);
      }
    }

    // Добавляем в новую группу
    plugin.parentId = parentId;
    const newParentId = parentId || 'root';
    if (!this.pluginsByParent.has(newParentId)) {
      this.pluginsByParent.set(newParentId, []);
    }
    this.pluginsByParent.get(newParentId)!.push(plugin);
  }

  /**
   * Получить все пункты меню из включенных плагинов
   * С учетом порядка и вложенности
   */
  getMenuItemsFromPlugins(): MenuItemConfig[] {
    if (!this.initialized) {
      this.logger.warn('PluginManager not initialized yet, returning empty array');
      return [];
    }

    const enabledPlugins = this.getEnabledPlugins();
    
    // Если нет включенных плагинов, возвращаем пустой массив
    if (enabledPlugins.length === 0) {
      return [];
    }

    // Для правильной вложенности нужно использовать ВСЕ плагины (включенные и выключенные)
    // чтобы правильно построить иерархию, но возвращать только включенные элементы
    const allPlugins = this.getAllPlugins();
    const enabledPluginIds = new Set(enabledPlugins.map(p => p.id));
    
    // Сортируем все плагины по порядку
    const sortedAllPlugins = allPlugins.sort((a, b) => a.order - b.order);

    // Строим дерево меню из всех плагинов (для правильной иерархии)
    const rootItems: MenuItemConfig[] = [];
    const itemsMap = new Map<string, MenuItemConfig>();

    // Сначала создаем все элементы из всех плагинов
    for (const plugin of sortedAllPlugins) {
      const menuItem: MenuItemConfig = {
        ...plugin.menuItem,
        id: plugin.id,
        enabled: plugin.enabled,
        order: plugin.order,
      };

      itemsMap.set(plugin.id, menuItem);
    }

    // Затем строим иерархию из всех плагинов
    // Важно: сначала добавляем все элементы в корень, потом перемещаем дочерние к родителям
    for (const plugin of sortedAllPlugins) {
      const menuItem = itemsMap.get(plugin.id)!;
      rootItems.push(menuItem);
    }

    // Теперь перемещаем дочерние элементы к их родителям
    for (const plugin of sortedAllPlugins) {
      if (plugin.parentId) {
        const menuItem = itemsMap.get(plugin.id)!;
        const parentItem = itemsMap.get(plugin.parentId);
        
        if (parentItem) {
          // Удаляем дочерний элемент из корня
          const indexInRoot = rootItems.findIndex(item => item.id === menuItem.id);
          if (indexInRoot !== -1) {
            rootItems.splice(indexInRoot, 1);
          }
          
          // Добавляем дочерний элемент к родителю
          if (!parentItem.children) {
            parentItem.children = [];
          }
          parentItem.children.push(menuItem);
        }
        // Если родитель не найден, элемент остается в корне
      }
    }

    // Функция для фильтрации: возвращаем только включенные элементы
    // Если родитель включен, его дочерние элементы (включенные и выключенные) должны быть в children
    // Но если родитель выключен, дочерние элементы не должны отображаться
    const filterEnabled = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items
        .filter((item) => {
          // Включаем элемент только если он включен
          return enabledPluginIds.has(item.id);
        })
        .map((item) => {
          // Если элемент включен, рекурсивно обрабатываем его дочерние элементы
          // Для включенного родителя включаем ВСЕ дочерние элементы (включенные и выключенные)
          // для правильной иерархии - фронтенд отфильтрует выключенные по enabled: false
          if (item.children && item.children.length > 0) {
            // Включаем все дочерние элементы (включенные и выключенные) для правильной иерархии
            // Это важно для правильного отображения вложенности, как в админ-панели
            const processedChildren = item.children.map((child) => {
              // Рекурсивно обрабатываем дочерние элементы
              if (child.children && child.children.length > 0) {
                return {
                  ...child,
                  children: filterEnabled(child.children),
                };
              }
              return child;
            });
            
            return {
              ...item,
              children: processedChildren,
            };
          }
          return item;
        });
    };

    // Фильтруем только включенные элементы
    const filteredItems = filterEnabled(rootItems);

    // Сортируем дочерние элементы
    const sortChildren = (items: MenuItemConfig[]): MenuItemConfig[] => {
      return items
        .map((item) => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: sortChildren(item.children),
            };
          }
          return item;
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    return sortChildren(filteredItems);
  }

  /**
   * Обновить конфигурацию плагина из пункта меню
   * Используется при сохранении настроек в админ-панели
   */
  updatePluginFromMenuItem(menuItem: MenuItemConfig): void {
    const plugin = this.plugins.get(menuItem.id);
    if (!plugin) {
      // Если плагин не найден, создаем новый (для кастомных пунктов)
      this.registerPluginFromMetadata({
        id: menuItem.id,
        name: menuItem.label || menuItem.id,
        type: menuItem.type === 'default' ? 'system' : 'custom',
        menuItem,
        order: menuItem.order || 0,
        parentId: undefined, // TODO: поддержать вложенность
      });
      return;
    }

    // Обновляем существующий плагин
    plugin.enabled = menuItem.enabled !== false;
    plugin.order = menuItem.order || 0;
    plugin.menuItem = menuItem;
  }

  /**
   * Получить все плагины в виде массива для админ-панели
   */
  getPluginsForAdmin(): Array<IMenuPlugin & { menuItem: MenuItemConfig }> {
    return this.getAllPlugins().map((plugin) => ({
      ...plugin,
      menuItem: plugin.menuItem,
    }));
  }
}

