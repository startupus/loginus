import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../design-system/contexts';

/**
 * LandingPage - приветственная страница Loginus ID
 * Создана на базе TailGrids MarketingComponents/Hero
 * Дизайн: чистый, современный, профессиональный
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleThemeToggle = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark">
      {/* Header - улучшенный стиль */}
      <header className="fixed left-0 top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-2 dark:bg-dark/80 dark:border-dark-3">
        <div className="container mx-auto">
          <div className="relative flex items-center justify-between py-4 px-4">
            {/* Logo - ВСЕГДА контрастный */}
            <a href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <span className="text-white font-bold text-xl drop-shadow-lg">L</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green rounded-full border-2 border-white dark:border-dark shadow-sm"></div>
              </div>
              <span className="text-2xl font-bold text-dark dark:text-white">
                Loginus ID
              </span>
            </a>
            
            {/* Nav + Actions */}
            <div className="flex items-center gap-8">
              {/* Navigation */}
              <nav className="hidden lg:block">
                <ul className="flex items-center gap-8">
                  <li>
                    <a href="/#about" className="text-base font-medium text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors">
                      О Loginus ID
                    </a>
                  </li>
                  <li>
                    <a href="/#features" className="text-base font-medium text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors">
                      Возможности
                    </a>
                  </li>
                  <li>
                    <a href="/#faq" className="text-base font-medium text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </nav>
              
              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Theme Switcher */}
                <button
                  onClick={handleThemeToggle}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-3 transition-all"
                  title={`Текущая тема: ${themeMode}. Кликните для переключения`}
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                
                {/* Login Button - с градиентом из дизайн-системы */}
                <Button
                  variant="primary"
                  size="lg"
                  gradient
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  }
                  onClick={() => navigate('/login')}
                >
                  Войти через Loginus ID
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - с красивым фоном */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-1 via-white to-blue-50 pt-32 pb-20 dark:from-dark dark:via-dark dark:to-dark-2 lg:pt-40 lg:pb-32">
        {/* Background декорации */}
        <div className="absolute top-0 right-0 -z-10 opacity-20">
          <svg width="450" height="556" viewBox="0 0 450 556" fill="none">
            <circle cx="277" cy="63" r="225" fill="url(#paint0_linear)" />
            <defs>
              <linearGradient id="paint0_linear" x1="277" y1="-162" x2="277" y2="288" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3758F9" stopOpacity="0.3" />
                <stop offset="1" stopColor="#3758F9" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 -z-10 opacity-10">
          <svg width="364" height="201" viewBox="0 0 364 201" fill="none">
            <circle cx="182" cy="182" r="182" fill="url(#paint1_linear)" />
            <defs>
              <linearGradient id="paint1_linear" x1="182" y1="0" x2="182" y2="364" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3758F9" stopOpacity="0.3" />
                <stop offset="1" stopColor="#3758F9" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto">
          <div className="flex flex-wrap items-center">
            {/* Left Content */}
            <div className="w-full px-4 lg:w-6/12">
              <div className="max-w-[570px]">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                  <span className="text-sm font-semibold text-primary">Новое</span>
                  <span className="text-sm text-body-color dark:text-dark-6">Двухфакторная аутентификация</span>
                </div>
                
                <h1 className="mb-6 text-5xl font-bold leading-tight text-dark dark:text-white sm:text-6xl lg:text-[64px]">
                  Единый аккаунт
                  <br />
                  <span className="text-primary">Loginus ID</span>
                </h1>
                
                <p className="mb-10 text-lg leading-relaxed text-body-color dark:text-dark-6">
                  Быстрая и безопасная авторизация для всех ваших сервисов.
                  Управляйте данными, платежами и семейным доступом в одном месте.
                </p>
                
                {/* CTA */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    variant="primary"
                    size="xl"
                    gradient
                    leftIcon={
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    }
                    onClick={() => navigate('/login')}
                  >
                    Войти через Loginus ID
                  </Button>
                  
                  <a
                    href="/#features"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors"
                  >
                    Узнать больше
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-12 flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-body-color dark:text-dark-6">Безопасно</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-body-color dark:text-dark-6">Быстро</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-body-color dark:text-dark-6">Удобно</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Service Cards с анимацией */}
            <div className="w-full px-4 lg:w-6/12 mt-12 lg:mt-0">
              <div className="relative">
                {/* Декоративный круг */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur-3xl"></div>
                
                <div className="relative grid grid-cols-2 gap-6">
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                    title="Безопасность"
                    description="2FA защита"
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title="Быстрый вход"
                    description="1 клик - и вы внутри"
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    }
                    title="Везде с вами"
                    description="Web, iOS, Android"
                  />
                  <ServiceCard 
                    icon={
                      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title="Единый профиль"
                    description="Все в одном месте"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-dark dark:text-white lg:text-5xl">
              Возможности Loginus ID
            </h2>
            <p className="mx-auto max-w-[600px] text-lg text-body-color dark:text-dark-6">
              Единый аккаунт для управления всеми вашими данными и сервисами
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              title="Персональные данные"
              description="Документы, адреса, контакты - всё под рукой"
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              title="Платежи"
              description="Безопасное хранение и быстрая оплата"
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Семейный доступ"
              description="Делитесь подписками с близкими"
            />
            <FeatureCard
              icon={
                <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Безопасность"
              description="Контроль сессий и доступа"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-1 py-20 dark:bg-dark-2 lg:py-28">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-dark dark:text-white lg:text-5xl">
              Часто задаваемые вопросы
            </h2>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <FAQItem
                question="Как создать аккаунт?"
                answer="При первом входе система автоматически создаст аккаунт. Просто введите телефон или email."
              />
              <FAQItem
                question="Безопасны ли данные?"
                answer="Используем современное шифрование и двухфакторную аутентификацию для защиты."
              />
              <FAQItem
                question="Как работает семейный доступ?"
                answer="Создайте семейную группу, пригласите участников и делитесь подписками."
              />
              <FAQItem
                question="Как восстановить доступ?"
                answer="Используйте форму восстановления через email или телефон в любой момент."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-2 bg-white py-10 dark:border-dark-3 dark:bg-dark">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <p className="text-sm text-body-color dark:text-dark-6">
                © {new Date().getFullYear()} Loginus ID. Все права защищены.
              </p>
            </div>
            <div className="flex gap-8">
              <a href="/about" className="text-sm font-medium text-body-color hover:text-primary dark:text-dark-6 transition-colors">
                О проекте
              </a>
              <a href="/privacy" className="text-sm font-medium text-body-color hover:text-primary dark:text-dark-6 transition-colors">
                Конфиденциальность
              </a>
              <a href="/terms" className="text-sm font-medium text-body-color hover:text-primary dark:text-dark-6 transition-colors">
                Условия
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Service Card - компактная карточка с hover эффектом
const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="group rounded-2xl bg-white p-8 shadow-1 transition-all duration-300 hover:shadow-3 hover:-translate-y-1 dark:bg-dark-2 dark:shadow-card dark:hover:shadow-3">
      <div className="mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-dark dark:text-white">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-body-color dark:text-dark-6">
        {description}
      </p>
    </div>
  );
};

// Feature Card - карточка возможности
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="group text-center">
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
        {icon}
      </div>
      <h4 className="mb-3 text-xl font-bold text-dark dark:text-white">
        {title}
      </h4>
      <p className="text-base text-body-color dark:text-dark-6">
        {description}
      </p>
    </div>
  );
};

// FAQ Item - вопрос-ответ
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-1 dark:bg-dark-2 dark:shadow-card">
      <h3 className="mb-3 text-lg font-bold text-dark dark:text-white">
        {question}
      </h3>
      <p className="text-base leading-relaxed text-body-color dark:text-dark-6">
        {answer}
      </p>
    </div>
  );
};

export default LandingPage;
