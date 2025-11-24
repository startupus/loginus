import { Component, ErrorInfo, ReactNode } from 'react';
import { themeClasses } from '../design-system/utils/themeClasses';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - компонент для перехвата ошибок React
 * Не зависит от i18n для избежания проблем с инициализацией
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${themeClasses.background.gray}`}>
          <div className="max-w-md w-full mx-auto px-4">
            <div className={`${themeClasses.card.shadow} p-8 text-center`}>
              <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${themeClasses.iconCircle.error}`}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  className="fill-current text-error"
                >
                  <path d="M20 5C11.716 5 5 11.716 5 20s6.716 15 15 15 15-6.716 15-15S28.284 5 20 5zm0 24c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm2-8h-4v-10h4v10z" />
                </svg>
              </div>
              <h3 className={`mb-2 text-xl font-semibold ${themeClasses.text.primary}`}>
                Что-то пошло не так
              </h3>
              <p className={`mb-6 ${themeClasses.text.secondary}`}>
                {this.state.error?.message || 'Произошла непредвиденная ошибка'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className={`inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90 transition-colors`}
              >
                Перезагрузить страницу
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

