import { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<Props, State> {
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
      const { t } = this.props;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-1 dark:bg-dark">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="bg-white dark:bg-dark-2 rounded-xl shadow-1 dark:shadow-card p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error-50 dark:bg-error-900/20">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  className="fill-current text-error-600 dark:text-error-400"
                >
                  <path d="M20 5C11.716 5 5 11.716 5 20s6.716 15 15 15 15-6.716 15-15S28.284 5 20 5zm0 24c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm2-8h-4v-10h4v10z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-dark dark:text-white">
                {t('errors.somethingWentWrong', 'Что-то пошло не так')}
              </h3>
              <p className="mb-6 text-body-color dark:text-dark-6">
                {this.state.error?.message || t('errors.unexpectedError', 'Произошла непредвиденная ошибка')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors"
              >
                {t('errors.reloadPage', 'Перезагрузить страницу')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);

