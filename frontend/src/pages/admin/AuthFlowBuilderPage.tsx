import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPageTemplate } from '../../design-system/layouts/AdminPageTemplate';
import { Button } from '../../design-system/primitives/Button';
import { Icon } from '../../design-system/primitives/Icon';
import { LoadingState } from '../../design-system/composites/LoadingState';
import { themeClasses } from '../../design-system/utils/themeClasses';
import { MethodColumn, AuthMethod } from '../../components/admin/MethodColumn';
import { AddAuthMethodModal } from '../../components/admin/AddAuthMethodModal';
import { authFlowApi } from '../../services/api/auth-flow';
import { useDebounce } from '../../hooks/useDebounce';
import { preloadModule } from '../../services/i18n/config';

/**
 * AuthFlowBuilderPage - страница настройки алгоритма авторизации
 * Drag & Drop конструктор для настройки методов входа
 * Две колонки: Авторизация и Регистрация
 */
const AuthFlowBuilderPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  
  // Предзагрузка модуля admin для переводов
  useEffect(() => {
    const loadAdminModule = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AuthFlowBuilderPage] Failed to preload admin module:', error);
        }
      }
    };

    loadAdminModule();

    // Перезагружаем модуль при смене языка
    const handleLanguageChanged = async () => {
      try {
        await preloadModule('admin');
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[AuthFlowBuilderPage] Failed to reload admin module on language change:', error);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  // Загрузка данных с сервера
  // Важно: refetchOnMount: true для получения актуальных данных при каждом открытии страницы
  // Это решает проблему с разным контентом в разных браузерах
  const { data: authFlowData, isLoading, error } = useQuery({
    queryKey: ['authFlow'],
    queryFn: async () => {
      const response = await authFlowApi.getAuthFlow();
      // Бэкенд оборачивает ответ в { success, data }, поэтому разворачиваем data
      return response.data?.data || response.data;
    },
    staleTime: 0, // Данные всегда считаются устаревшими, чтобы получать свежие данные
    gcTime: 5 * 60 * 1000, // Храним в кеше 5 минут для быстрого отображения
    refetchOnMount: true, // Всегда загружаем свежие данные при монтировании
    refetchOnWindowFocus: false, // Не перезагружаем при фокусе окна
    retry: 1,
    retryDelay: 1000,
  });

  // Базовые методы авторизации (без переводов)
  const baseAuthMethods = useMemo(() => [
    { id: 'phone-email', icon: 'mail', enabled: true, isPrimary: true, order: 1, type: 'primary' as const },
    { id: 'github', icon: 'github', enabled: true, isPrimary: false, order: 2, type: 'oauth' as const },
    { id: 'telegram', icon: 'message-circle', enabled: true, isPrimary: false, order: 3, type: 'oauth' as const },
    { id: 'gosuslugi', icon: 'shield', enabled: true, isPrimary: false, order: 4, type: 'oauth' as const },
    { id: 'tinkoff', icon: 'tinkoff', enabled: true, isPrimary: false, order: 5, type: 'oauth' as const },
    { id: 'qr', icon: 'qr-code', enabled: true, isPrimary: false, order: 6, type: 'alternative' as const },
    { id: 'password', icon: 'lock', enabled: true, isPrimary: false, order: 7, type: 'alternative' as const },
    { id: 'yandex', icon: 'user', enabled: true, isPrimary: false, order: 8, type: 'oauth' as const },
    { id: 'saber', icon: 'user', enabled: false, isPrimary: false, order: 9, type: 'oauth' as const },
  ], []);

  // Состояние методов авторизации
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([]);
  
  // Флаг для отслеживания локальных изменений (которые еще не сохранены)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Мутация для сохранения (объявляем до использования в useEffect)
  const saveMutation = useMutation({
    mutationFn: (methods: AuthMethod[]) => authFlowApi.updateAuthFlow(methods),
    onSuccess: () => {
      // Инвалидируем кэш публичного алгоритма авторизации, чтобы формы входа/регистрации обновились
      queryClient.invalidateQueries({ queryKey: ['auth-flow-public'] });
      // Обновляем данные из API после задержки, чтобы дать серверу время обработать запрос
      // НЕ сбрасываем hasUnsavedChanges сразу - это сделает useEffect после загрузки обновленных данных
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['authFlow'] });
      }, 500); // Увеличиваем задержку до 500ms для надежности
    },
    onError: () => {
      // При ошибке сохраняем флаг, чтобы не перезаписывать состояние
      // Флаг будет сброшен при следующем успешном сохранении
    },
  });

  // Синхронизация методов с данными из API
  useEffect(() => {
    if (isLoading) return;
    
    // Не перезаписываем состояние, если есть несохраненные локальные изменения или идет сохранение
    if (hasUnsavedChanges || saveMutation.isPending) return;

    if (authFlowData) {
      // Объединяем методы из login, registration и factors
      let allMethods = [
        ...(authFlowData.login || []).map((m: any) => ({ ...m, flow: 'login' as const })),
        ...(authFlowData.registration || []).map((m: any) => ({ ...m, flow: 'registration' as const })),
        ...(authFlowData.factors || []).map((m: any) => ({ ...m, flow: 'factors' as const })),
      ];
      
      // Для factors flow всегда добавляем обязательный первый шаг "Окно входа" если его нет
      const hasLoginWindow = allMethods.some(m => m.flow === 'factors' && m.id === 'login-window');
      if (!hasLoginWindow) {
        const loginWindowMethod: AuthMethod = {
          id: 'login-window',
          name: t('admin.authFlow.login', 'Окно входа'),
          icon: 'log-in',
          enabled: true,
          isPrimary: false,
          order: 0,
          type: 'auth-factor',
          flow: 'factors',
          stepType: 'auth-method',
        };
        // Увеличиваем order для существующих методов factors
        allMethods = allMethods.map(m => 
          m.flow === 'factors' ? { ...m, order: (m.order || 0) + 1 } : m
        );
        allMethods.push(loginWindowMethod);
      }
      const methodsWithNames = allMethods.map(method => ({
        ...method,
        name: method.name || t(`admin.authFlow.methods.${method.id}`, method.id),
      }));
      
      // Обновляем состояние, сравнивая структуру данных
      setAuthMethods(prevMethods => {
        // Если есть несохраненные изменения, используем локальное состояние как источник истины
        // и только обновляем имена методов из API (для поддержки смены языка)
        if (hasUnsavedChanges) {
          return prevMethods.map(prevMethod => {
            const apiMethod = methodsWithNames.find(
              m => m.id === prevMethod.id && m.flow === prevMethod.flow
            );
            if (apiMethod) {
              // Обновляем только имя, сохраняя остальные свойства из локального состояния
              return { ...prevMethod, name: apiMethod.name };
            }
            return prevMethod;
          });
        }
        
        // Если есть локальные методы, которых нет в API (недавно добавленные), сохраняем их
        const localOnlyMethods = prevMethods.filter(prevMethod => 
          !methodsWithNames.some(apiMethod => 
            apiMethod.id === prevMethod.id && apiMethod.flow === prevMethod.flow
          )
        );
        
        // Объединяем методы из API с локальными методами, которых еще нет в API
        const mergedMethods = [...methodsWithNames, ...localOnlyMethods];
        
        // Создаем ключи для сравнения структуры (без имен для избежания циклов)
        const prevIds = prevMethods.map(m => `${m.id}-${m.flow}-${m.order}`).sort().join(',');
        const newIds = mergedMethods.map(m => `${m.id}-${m.flow}-${m.order}`).sort().join(',');
        
        // Если структура идентична, обновляем только имена (при смене языка)
        if (prevIds === newIds && prevMethods.length > 0) {
          return prevMethods.map(prevMethod => {
            const updatedMethod = mergedMethods.find(
              m => m.id === prevMethod.id && m.flow === prevMethod.flow
            );
            if (updatedMethod) {
              return { ...prevMethod, name: updatedMethod.name };
            }
            return prevMethod;
          });
        }
        
        // Если структура изменилась или это первая загрузка, используем объединенные методы
        // Гарантируем, что в каждом потоке есть ровно один primary метод
        const loginMethods = mergedMethods.filter(m => m.flow === 'login');
        const registrationMethods = mergedMethods.filter(m => m.flow === 'registration');
        
        // Для потока login: оставляем только один primary метод (первый по порядку)
        const primaryLoginMethods = loginMethods.filter(m => m.isPrimary);
        if (primaryLoginMethods.length > 1) {
          // Если несколько primary, оставляем только первый по порядку
          const firstPrimary = primaryLoginMethods.sort((a, b) => a.order - b.order)[0];
          mergedMethods.forEach(m => {
            if (m.flow === 'login') {
              m.isPrimary = m.id === firstPrimary.id;
            }
          });
        } else if (loginMethods.length > 0 && !loginMethods.some(m => m.isPrimary)) {
          // Если нет primary методов, делаем первый primary
          const firstLogin = loginMethods.sort((a, b) => a.order - b.order)[0];
          const index = mergedMethods.findIndex(m => m.id === firstLogin.id && m.flow === 'login');
          if (index !== -1) {
            mergedMethods[index].isPrimary = true;
          }
        }
        
        // Для потока registration: оставляем только один primary метод (первый по порядку)
        const primaryRegistrationMethods = registrationMethods.filter(m => m.isPrimary);
        if (primaryRegistrationMethods.length > 1) {
          // Если несколько primary, оставляем только первый по порядку
          const firstPrimary = primaryRegistrationMethods.sort((a, b) => a.order - b.order)[0];
          mergedMethods.forEach(m => {
            if (m.flow === 'registration') {
              m.isPrimary = m.id === firstPrimary.id;
            }
          });
        } else if (registrationMethods.length > 0 && !registrationMethods.some(m => m.isPrimary)) {
          // Если нет primary методов, делаем первый primary
          const firstRegistration = registrationMethods.sort((a, b) => a.order - b.order)[0];
          const index = mergedMethods.findIndex(m => m.id === firstRegistration.id && m.flow === 'registration');
          if (index !== -1) {
            mergedMethods[index].isPrimary = true;
          }
        }
        
        return mergedMethods;
      });
    } else if (!isLoading && !hasUnsavedChanges && !saveMutation.isPending) {
      // Если данных нет и состояние пустое, создаем дефолтные методы
      setAuthMethods(prevMethods => {
        if (prevMethods.length > 0) return prevMethods; // Не перезаписываем если уже есть методы
        
    const loginMethods = baseAuthMethods.slice(0, Math.ceil(baseAuthMethods.length / 2));
    const registrationMethods = baseAuthMethods.slice(Math.ceil(baseAuthMethods.length / 2));
    
        const defaultMethods = [
      ...loginMethods.map(m => ({ ...m, flow: 'login' as const, name: t(`admin.authFlow.methods.${m.id}`) })),
      ...registrationMethods.map(m => ({ ...m, flow: 'registration' as const, name: t(`admin.authFlow.methods.${m.id}`) })),
    ];
        
        // Гарантируем, что в каждом потоке есть ровно один primary метод
        const defaultLoginMethods = defaultMethods.filter(m => m.flow === 'login');
        const defaultRegistrationMethods = defaultMethods.filter(m => m.flow === 'registration');

        // Для потока login: устанавливаем primary только для первого метода
        if (defaultLoginMethods.length > 0) {
          const firstLogin = defaultLoginMethods.sort((a, b) => a.order - b.order)[0];
          defaultMethods.forEach(m => {
            if (m.flow === 'login') {
              m.isPrimary = m.id === firstLogin.id;
            }
          });
        }
        
        // Для потока registration: устанавливаем primary только для первого метода
        if (defaultRegistrationMethods.length > 0) {
          const firstRegistration = defaultRegistrationMethods.sort((a, b) => a.order - b.order)[0];
          defaultMethods.forEach(m => {
            if (m.flow === 'registration') {
              m.isPrimary = m.id === firstRegistration.id;
            }
          });
        }
        
        return defaultMethods;
      });
    }
  }, [authFlowData, isLoading, t, i18n.language, baseAuthMethods, hasUnsavedChanges, saveMutation.isPending]);

  // Флаг для отслеживания первой загрузки данных
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSyncedMethods, setLastSyncedMethods] = useState<string>('');

  // Debounce для автосохранения
  const debouncedMethods = useDebounce(authMethods, 1000);

  // Отмечаем завершение первой загрузки
  useEffect(() => {
    if (!isLoading && authFlowData !== undefined) {
      setIsInitialLoad(false);
    }
  }, [isLoading, authFlowData]);

  // Проверяем синхронизацию после сохранения: если данные из API соответствуют локальному состоянию, сбрасываем флаг
  useEffect(() => {
    if (!hasUnsavedChanges || isLoading || saveMutation.isPending || !authFlowData) return;

    // Сравниваем структуру данных из API с локальным состоянием
    const apiMethods = [
      ...(authFlowData.login || []).map((m: any) => ({ ...m, flow: 'login' as const })),
      ...(authFlowData.registration || []).map((m: any) => ({ ...m, flow: 'registration' as const })),
      ...(authFlowData.factors || []).map((m: any) => ({ ...m, flow: 'factors' as const })),
    ];

    // Создаем ключи для сравнения (без имен, только структура)
    const apiKeys = apiMethods
      .map(m => `${m.id}-${m.flow}-${m.order}-${m.enabled ? '1' : '0'}-${m.isPrimary ? '1' : '0'}`)
      .sort()
      .join(',');
    const localKeys = authMethods
      .map(m => `${m.id}-${m.flow}-${m.order}-${m.enabled ? '1' : '0'}-${m.isPrimary ? '1' : '0'}`)
      .sort()
      .join(',');

    // Если структуры совпадают, значит сохранение применилось - сбрасываем флаг
    if (apiKeys === localKeys) {
      setHasUnsavedChanges(false);
    }
  }, [authFlowData, authMethods, hasUnsavedChanges, isLoading, saveMutation.isPending]);

  // Автосохранение при изменении методов (только после первой загрузки и если методы действительно изменились)
  useEffect(() => {
    if (!isInitialLoad && debouncedMethods.length > 0 && !isLoading && !saveMutation.isPending) {
      // Для factors flow всегда убеждаемся, что есть обязательный метод "Окно входа"
      let methodsToSave = [...debouncedMethods];
      const factorsMethods = methodsToSave.filter(m => m.flow === 'factors');
      const hasLoginWindow = factorsMethods.some(m => m.id === 'login-window');
      
      if (!hasLoginWindow) {
        const loginWindowMethod: AuthMethod = {
          id: 'login-window',
          name: t('admin.authFlow.login', 'Окно входа'),
          icon: 'log-in',
          enabled: true,
          isPrimary: false,
          order: 0,
          type: 'auth-factor',
          flow: 'factors',
          stepType: 'auth-method',
        };
        // Увеличиваем order для существующих methods factors
        methodsToSave = methodsToSave.map(m => 
          m.flow === 'factors' ? { ...m, order: (m.order || 0) + 1 } : m
        );
        methodsToSave.push(loginWindowMethod);
      }
      
      // Проверяем, действительно ли методы изменились
      const currentMethodsKey = JSON.stringify(
        methodsToSave.map(m => ({ id: m.id, flow: m.flow, enabled: m.enabled, isPrimary: m.isPrimary, order: m.order }))
          .sort((a, b) => a.order - b.order)
      );
      
      if (currentMethodsKey !== lastSyncedMethods) {
        setLastSyncedMethods(currentMethodsKey);
        setHasUnsavedChanges(true);
        saveMutation.mutate(methodsToSave);
      }
    }
  }, [debouncedMethods, isLoading, isInitialLoad, lastSyncedMethods, saveMutation.isPending, t]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalFlow, setAddModalFlow] = useState<'login' | 'registration' | 'factors'>('login');

  const handleAddLoginMethod = () => {
    setAddModalFlow('login');
    setIsAddModalOpen(true);
  };

  const handleAddRegistrationMethod = () => {
    setAddModalFlow('registration');
    setIsAddModalOpen(true);
  };

  const handleAddFactorsMethod = () => {
    setAddModalFlow('factors');
    setIsAddModalOpen(true);
  };

  const handleAddMethod = (methodData: Omit<AuthMethod, 'name'> & { name?: string }) => {
    const flowMethods = authMethods.filter(m => m.flow === methodData.flow);
    const hasPrimaryInFlow = flowMethods.some(m => m.isPrimary);
    
    // Определяем имя метода в зависимости от типа шага
    let methodName = methodData.name;
    if (!methodName) {
      if (methodData.stepType === 'field') {
        // Для шагов регистрации используем переводы для шагов
        methodName = t(`admin.authFlow.registrationSteps.${methodData.id}`);
      } else {
        // Для методов авторизации используем переводы для методов
        methodName = t(`admin.authFlow.methods.${methodData.id}`);
      }
    }
    
    const newMethod: AuthMethod = {
      ...methodData,
      name: methodName,
      // Для шагов регистрации и факторов авторизации не делаем primary, только для методов авторизации в login/registration
      isPrimary: (methodData.stepType !== 'field') && (methodData.flow !== 'factors') && (!hasPrimaryInFlow || (flowMethods.length === 0)),
    };
    
    // Для factors flow всегда убеждаемся, что есть обязательный метод "Окно входа"
    let methodsToAdd = [...authMethods, newMethod];
    
    if (methodData.flow === 'factors') {
      const factorsMethods = methodsToAdd.filter(m => m.flow === 'factors');
      const hasLoginWindow = factorsMethods.some(m => m.id === 'login-window');
      
      if (!hasLoginWindow) {
        const loginWindowMethod: AuthMethod = {
          id: 'login-window',
          name: t('admin.authFlow.login', 'Окно входа'),
          icon: 'log-in',
          enabled: true,
          isPrimary: false,
          order: 0,
          type: 'auth-factor',
          flow: 'factors',
          stepType: 'auth-method',
        };
        // Увеличиваем order для остальных methods factors (кроме только что добавленного)
        methodsToAdd = methodsToAdd.map(m => 
          m.flow === 'factors' && m.id !== newMethod.id
            ? { ...m, order: (m.order || 0) + 1 }
            : m
        );
        methodsToAdd.push(loginWindowMethod);
      }
    }
    
    // Помечаем, что есть локальные изменения
    setHasUnsavedChanges(true);
    setAuthMethods(methodsToAdd);
  };

  const handleRemoveMethod = (methodId: string, flow: 'login' | 'registration' | 'factors') => {
    // Нельзя удалить обязательный метод "Окно входа" из factors
    if (flow === 'factors' && methodId === 'login-window') {
      return;
    }
    
    const methodToRemove = authMethods.find(m => m.id === methodId && m.flow === flow);
    if (!methodToRemove) return;

    const flowMethods = authMethods.filter(m => m.flow === flow);
    const remainingMethods = flowMethods.filter(m => m.id !== methodId);
    
    // Если удаляем primary метод и есть другие методы в потоке, делаем первый из них primary
    let updatedMethods = authMethods.filter(m => !(m.id === methodId && m.flow === flow));
    
    if (methodToRemove.isPrimary && remainingMethods.length > 0) {
      // Находим первый метод в потоке по порядку и делаем его primary, остальные снимаем primary
      const sortedRemaining = remainingMethods.sort((a, b) => a.order - b.order);
      const firstRemainingMethod = sortedRemaining[0];
      updatedMethods = updatedMethods.map(m => {
        if (m.flow === flow) {
          // В том же потоке: устанавливаем primary только для первого метода
          return m.id === firstRemainingMethod.id 
            ? { ...m, isPrimary: true }
            : { ...m, isPrimary: false };
        }
        return m; // В других потоках не меняем
      });
    }
    
    setHasUnsavedChanges(true);
    setAuthMethods(updatedMethods);
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string, flow: 'login' | 'registration' | 'factors') => {
    e.preventDefault();
    if (!draggedItem || draggedItem === id) return;

    // Фильтруем методы по потоку
    const flowMethods = authMethods.filter(m => m.flow === flow);
    const draggedIndex = flowMethods.findIndex(m => m.id === draggedItem);
    const targetIndex = flowMethods.findIndex(m => m.id === id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Проверяем, что перетаскиваемый метод из того же потока
    const draggedMethod = authMethods.find(m => m.id === draggedItem);
    if (!draggedMethod || draggedMethod.flow !== flow) return;

    const newMethods = [...authMethods];
    const flowMethodIds = flowMethods.map(m => m.id);
    const [removed] = flowMethodIds.splice(draggedIndex, 1);
    flowMethodIds.splice(targetIndex, 0, removed);

    // Обновляем порядок методов в потоке
    flowMethodIds.forEach((methodId, index) => {
      const method = newMethods.find(m => m.id === methodId);
      if (method) {
        method.order = index + 1;
      }
    });

    setHasUnsavedChanges(true);
    setAuthMethods(newMethods);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const togglePrimary = (id: string) => {
    const method = authMethods.find(m => m.id === id);
    if (!method) return;

    // Если пытаемся снять primary, проверяем, есть ли еще primary методы в том же потоке
    if (method.isPrimary) {
      const flowMethods = authMethods.filter(m => m.flow === method.flow);
      const primaryCount = flowMethods.filter(m => m.isPrimary).length;
      
      // Если это последний primary метод в потоке, не позволяем снять primary
      if (primaryCount === 1) {
        return; // Нельзя снять primary с последнего метода
      }
    }

    setHasUnsavedChanges(true);
    
    // Если устанавливаем primary, снимаем primary со всех остальных методов в том же потоке
    if (!method.isPrimary) {
      setAuthMethods(authMethods.map(m => {
        if (m.flow === method.flow) {
          // В том же потоке: устанавливаем primary только для выбранного метода
          return m.id === id ? { ...m, isPrimary: true } : { ...m, isPrimary: false };
        }
        return m; // В других потоках не меняем
      }));
    } else {
      // Если снимаем primary (и это не последний), просто снимаем
      setAuthMethods(authMethods.map(m => 
        m.id === id ? { ...m, isPrimary: false } : m
      ));
    }
  };

  const toggleEnabled = (id: string) => {
    setHasUnsavedChanges(true);
    setAuthMethods(authMethods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
  };

  // Разделяем методы по потокам
  const loginMethods = authMethods.filter(m => m.flow === 'login').sort((a, b) => a.order - b.order);
  const registrationMethods = authMethods.filter(m => m.flow === 'registration').sort((a, b) => a.order - b.order);
  
  // Для factors flow всегда добавляем обязательный первый шаг "Окно входа"
  const factorsMethodsFromState = authMethods.filter(m => m.flow === 'factors').sort((a, b) => a.order - b.order);
  
  // Проверяем, есть ли уже "Окно входа" в factors
  const hasLoginWindow = factorsMethodsFromState.some(m => m.id === 'login-window');
  
  // Создаем обязательный метод "Окно входа" если его нет
  const loginWindowMethod: AuthMethod = {
    id: 'login-window',
    name: t('admin.authFlow.login', 'Окно входа'),
    icon: 'log-in',
    enabled: true,
    isPrimary: false,
    order: 0, // Всегда первый
    type: 'auth-factor',
    flow: 'factors',
    stepType: 'auth-method',
  };
  
  // Объединяем обязательный метод с остальными
  const factorsMethods = hasLoginWindow 
    ? factorsMethodsFromState 
    : [loginWindowMethod, ...factorsMethodsFromState.map(m => ({ ...m, order: m.order + 1 }))];

  // Проверяем, можно ли снять primary с метода
  const canTogglePrimary = (id: string) => {
    const method = authMethods.find(m => m.id === id);
    if (!method || !method.isPrimary) return true;
    
    const flowMethods = authMethods.filter(m => m.flow === method.flow);
    const primaryCount = flowMethods.filter(m => m.isPrimary).length;
    
    // Можно снять primary только если есть другие primary методы в потоке
    return primaryCount > 1;
  };

  // Показываем ошибку если запрос не удался
  if (error) {
    return (
      <AdminPageTemplate 
        title={t('admin.authFlow.title')} 
        showSidebar={true}
      >
        <div className={`${themeClasses.card.default} ${themeClasses.spacing.p6} text-center`}>
          <Icon name="alert-circle" size="lg" className={`${themeClasses.text.destructive} ${themeClasses.spacing.mb4}`} />
          <p className={themeClasses.text.destructive}>
            {t('common.error', 'Ошибка загрузки данных')}
          </p>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['authFlow'] })}
            className={themeClasses.spacing.mt4}
          >
            {t('common.retry', 'Повторить')}
          </Button>
        </div>
      </AdminPageTemplate>
    );
  }

  if (isLoading) {
    return (
      <AdminPageTemplate 
        title={t('admin.authFlow.title')} 
        showSidebar={true}
      >
        <LoadingState text={t('common.loading')} />
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate 
      title={t('admin.authFlow.title')} 
      showSidebar={true}
    >
      <div className={`${themeClasses.spacing.p4} sm:${themeClasses.spacing.p6} ${themeClasses.spacing.pb24} sm:${themeClasses.spacing.pb6}`}>
        {/* Инструкция */}
        <div className={`${themeClasses.card.default} ${themeClasses.spacing.p4} ${themeClasses.spacing.mb6}`}>
          <div className={`${themeClasses.utility.flexItemsStart} ${themeClasses.spacing.gap3}`}>
            <Icon name="info" size="md" className={`${themeClasses.text.primary} ${themeClasses.spacing.mt1}`} />
            <div>
              <p className={`text-sm ${themeClasses.text.primary} font-medium ${themeClasses.spacing.mb2}`}>
                {t('admin.authFlow.instruction.title')}
              </p>
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {t('admin.authFlow.instruction.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Две колонки: Окно входа и Регистрация */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${themeClasses.spacing.gap6} ${themeClasses.spacing.mb6}`}>
          <MethodColumn
            title={t('admin.authFlow.login')}
            methods={loginMethods}
            flow="login"
            draggedItem={draggedItem}
            onAddMethod={handleAddLoginMethod}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onTogglePrimary={togglePrimary}
            onToggleEnabled={toggleEnabled}
            onRemoveMethod={handleRemoveMethod}
            canTogglePrimary={canTogglePrimary}
          />
          <MethodColumn
            title={t('admin.authFlow.registration')}
            methods={registrationMethods}
            flow="registration"
            draggedItem={draggedItem}
            onAddMethod={handleAddRegistrationMethod}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onTogglePrimary={togglePrimary}
            onToggleEnabled={toggleEnabled}
            onRemoveMethod={handleRemoveMethod}
            canTogglePrimary={canTogglePrimary}
          />
        </div>

        {/* Колонка Факторы авторизации ниже */}
        <div className={themeClasses.spacing.mt6}>
          <MethodColumn
            title={t('admin.authFlow.factors')}
            methods={factorsMethods}
            flow="factors"
            draggedItem={draggedItem}
            onAddMethod={handleAddFactorsMethod}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onTogglePrimary={togglePrimary}
            onToggleEnabled={toggleEnabled}
            onRemoveMethod={handleRemoveMethod}
            canTogglePrimary={canTogglePrimary}
          />
        </div>
      </div>

      {/* Модальное окно добавления/удаления метода */}
      <AddAuthMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        flow={addModalFlow}
        onAdd={handleAddMethod}
        onRemove={handleRemoveMethod}
        existingMethods={authMethods}
      />
    </AdminPageTemplate>
  );
};

export default AuthFlowBuilderPage;
