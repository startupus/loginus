import React from 'react';
import { useTranslation } from 'react-i18next';
import { useClientSafe } from '../../design-system/contexts';
import { HelpArticlePage } from './HelpArticlePage';
import { themeClasses } from '../../design-system/utils/themeClasses';

const AuthorizationHelpPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasFeature } = useClientSafe();

  // Условная функциональность через Multi-tenant Support
  const showAdvancedSections = hasFeature('help-authorization-advanced') !== false; // По умолчанию показываем все

  const sections = [
    { id: 'set-auth-methods', title: t('help.authorization.sections.setAuthMethods', 'Настроить способы входа') },
    { id: 'cannot-auth', title: t('help.authorization.sections.cannotAuth', 'Не получается войти в аккаунт') },
    ...(showAdvancedSections ? [
      { id: 'foreign-pc', title: t('help.authorization.sections.foreignPc', 'Как безопасно входить на Loginus на чужом устройстве') },
    ] : []),
  ];

  return (
    <HelpArticlePage
      title={t('help.authorization.title', 'Вход на Loginus')}
      sections={sections}
      prevArticle={{
        title: t('help.sidebar.yourId', 'Ваш Loginus ID'),
        href: '/help',
      }}
      nextArticle={{
        title: t('help.sidebar.loginNoPassword', 'Вход без пароля'),
        href: '/help/authorization/no-password',
      }}
    >
      <div className={themeClasses.typography.prose}>
        <p className={`${themeClasses.typographySize.bodyLarge} ${themeClasses.text.secondary} ${themeClasses.spacing.mb8}`}>
          {t('help.authorization.intro', 'Чтобы работать с персональными сервисами Loginus (Почтой, Диском и т. п.), войдите в аккаунт одним из способов:')}
        </p>

        <ul className={`${themeClasses.spacing.spaceY2} ${themeClasses.spacing.mb8} ${themeClasses.text.secondary}`}>
          <li>{t('help.authorization.methods.password', 'введите логин и пароль на сервисе')}</li>
          <li>{t('help.authorization.methods.qr', 'сканируйте QR-код в приложении Loginus')}</li>
          <li>{t('help.authorization.methods.biometric', 'настройте распознавание лица или отпечаток пальца')}</li>
          <li>{t('help.authorization.methods.phone', 'введите номер телефона на любом сервисе Loginus')}</li>
          <li>
            {t('help.authorization.methods.key', 'с помощью Loginus Ключа:')}
            <ul className={`${themeClasses.spacing.mt2} ${themeClasses.spacing.ml6} ${themeClasses.spacing.spaceY1}`}>
              <li>{t('help.authorization.methods.keyQr', 'сканируйте QR-код или введите одноразовый пароль')}</li>
              <li>{t('help.authorization.methods.keyPassword', 'введите постоянный пароль, а затем используйте одноразовый пароль из Loginus Ключа или другого приложения на базе алгоритма TOTP RFC либо сканируйте QR-код в приложении Loginus Ключ')}</li>
              <li>{t('help.authorization.methods.keyPicture', 'выберите картинку')}</li>
            </ul>
          </li>
        </ul>

        <section id="set-auth-methods" className={themeClasses.spacing.mb12}>
          <h2 className={`${themeClasses.typographySize.h2} ${themeClasses.text.primary} ${themeClasses.spacing.mb4}`}>
            {sections[0].title}
          </h2>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.setAuthMethods.intro', 'Вы можете выбрать, каким способом входить в аккаунт:')}
          </p>
          <ol className={`${themeClasses.listExtended.ordered} ${themeClasses.spacing.spaceY3} ${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            <li>{t('help.authorization.setAuthMethods.step1', 'Откройте вкладку Безопасность.')}</li>
            <li>
              {t('help.authorization.setAuthMethods.step2', 'В разделе Способ входа в профиль нажмите на текущий способ входа и выберите:')}
              <ul className={`${themeClasses.listExtended.unordered} ${themeClasses.spacing.ml6} ${themeClasses.spacing.mt2} ${themeClasses.spacing.spaceY2}`}>
                <li>
                  <strong>{t('help.authorization.setAuthMethods.passwordSms', 'Пароль + смс')}</strong> — {t('help.authorization.setAuthMethods.passwordSmsDesc', 'безопаснее, чем вход с паролем. Для входа нужно будет сначала ввести пароль, а затем — код из смс, код из пуш-уведомления или последние 6 цифр входящего номера. Так, даже зная пароль, злоумышленник не сможет попасть в аккаунт без доступа к вашему телефону.')}
                </li>
                <li>
                  <strong>{t('help.authorization.setAuthMethods.passwordOtp', 'Пароль + одноразовый пароль')}</strong> — {t('help.authorization.setAuthMethods.passwordOtpDesc', 'самый надежный способ. Для входа нужно будет ввести сначала обычный пароль, а затем одноразовый пароль из приложения Loginus Ключ или другого приложения на базе алгоритма TOTP RFC.')}
                </li>
                <li>
                  <strong>{t('help.authorization.setAuthMethods.password', 'Обычный пароль')}</strong> — {t('help.authorization.setAuthMethods.passwordDesc', 'самый простой. Для входа будет достаточно ввести пароль. Небезопасно, поскольку злоумышленник, который узнал пароль, сможет легко проникнуть в ваш аккаунт.')}
                </li>
              </ul>
            </li>
            <li>
              {t('help.authorization.setAuthMethods.step3', 'Если нужно, включите вспомогательные способы, которые не требуют ввода пароля:')}
              <ul className={`${themeClasses.listExtended.unordered} ${themeClasses.spacing.ml6} ${themeClasses.spacing.mt2} ${themeClasses.spacing.spaceY1}`}>
                <li>{t('help.authorization.setAuthMethods.qr', 'Вход с помощью QR-кода из приложения Loginus.')}</li>
                <li>{t('help.authorization.setAuthMethods.picture', 'Вход по картинке из Loginus Ключа.')}</li>
              </ul>
            </li>
          </ol>
        </section>

        <section id="cannot-auth" className={themeClasses.spacing.mb12}>
          <h2 className={`${themeClasses.typographySize.h2} ${themeClasses.text.primary} ${themeClasses.spacing.mb4}`}>
            {sections[1].title}
          </h2>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.cannotAuth.intro', 'Если вы видите сообщение «К сожалению, логин занят», возможно, вы находитесь на странице регистрации или уже авторизованы в аккаунте, который зарегистрировали по упрощенной системе без логина.')}
          </p>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.cannotAuth.steps', 'Чтобы войти в аккаунт с логином:')}
          </p>
          <ol className={`${themeClasses.listExtended.ordered} ${themeClasses.spacing.spaceY3} ${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            <li>{t('help.authorization.cannotAuth.step1', 'Перейдите на страницу авторизации.')}</li>
            <li>{t('help.authorization.cannotAuth.step2', 'Проверьте, что Caps Lock на клавиатуре не активен и выбрана английская раскладка.')}</li>
            <li>
              {t('help.authorization.cannotAuth.step3', 'В поле Логин или email введите ваш логин и нажмите Войти. Если у вас нет поля Логин или email, нажмите Ещё → Войти по логину → введите ваш логин в поле Логин или email и нажмите Войти.')}
            </li>
            <li>{t('help.authorization.cannotAuth.step4', 'Введите пароль от аккаунта и еще раз нажмите Войти.')}</li>
          </ol>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.cannotAuth.phone', 'Если при входе по номеру телефона вы не видите в списке аккаунтов нужный профиль, попробуйте найти его по имени. Для этого нажмите Нет нужного профиля → Найти по имени и фамилии. Если не получится сразу, попробуйте разные варианты написания.')}
          </p>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.cannotAuth.loginPhone', 'Если вы не можете войти с помощью номера телефона в аккаунт, у которого есть логин на Loginus:')}
          </p>
          <ol className={`${themeClasses.listExtended.ordered} ${themeClasses.spacing.spaceY3} ${themeClasses.text.secondary}`}>
            <li>{t('help.authorization.cannotAuth.loginPhoneStep1', 'Войдите в аккаунт с вашим логином и паролем. Это можно сделать в браузере, на странице авторизации или в поисковом приложении, например Loginus Старт или Loginus — с Алисой.')}</li>
            <li>{t('help.authorization.cannotAuth.loginPhoneStep2', 'После авторизации подтвердите номер телефона на странице подтверждения. Теперь вы сможете входить в аккаунт по номеру телефона.')}</li>
          </ol>
        </section>

        <section id="foreign-pc" className={themeClasses.spacing.mb12}>
          <h2 className={`${themeClasses.typographySize.h2} ${themeClasses.text.primary} ${themeClasses.spacing.mb4}`}>
            {sections[2].title}
          </h2>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.foreignPc.intro', 'Когда вы авторизовались на Loginus, снова вводить пароль на этом устройстве придется только в случае, если вы не будете заходить на сервисы Loginus три месяца или больше. Это удобно для личного или домашнего компьютера, но опасно на компьютерах общего пользования (например, в интернет-кафе): если вы забудете выйти из аккаунта, следующий человек за тем же компьютером получит доступ к вашим данным.')}
          </p>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.foreignPc.incognito', 'Чтобы обезопасить свой аккаунт на чужом компьютере, используйте режим инкогнито в браузере.')}
          </p>
          <p className={`${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            {t('help.authorization.foreignPc.noIncognito', 'Если на компьютере нет браузера, который поддерживает режим инкогнито:')}
          </p>
          <ul className={`${themeClasses.listExtended.unordered} ${themeClasses.spacing.spaceY2} ${themeClasses.text.secondary} ${themeClasses.spacing.mb4}`}>
            <li>{t('help.authorization.foreignPc.disableAutofill', 'Отключите автозаполнение форм и сохранение паролей.')}</li>
            <li>{t('help.authorization.foreignPc.clearCache', 'Перед началом работы очистите кеш и удалите файлы cookie.')}</li>
            <li>
              {t('help.authorization.foreignPc.finishing', 'Завершая работу:')}
              <ul className={`${themeClasses.listExtended.unordered} ${themeClasses.spacing.ml6} ${themeClasses.spacing.mt2} ${themeClasses.spacing.spaceY1}`}>
                <li>{t('help.authorization.foreignPc.logout', 'Выйдите из аккаунта — нажмите свой портрет в правом верхнем углу и выберите пункт Выйти в выпадающем меню.')}</li>
                <li>{t('help.authorization.foreignPc.clearAgain', 'Еще раз очистите кеш и удалите файлы cookie.')}</li>
              </ul>
            </li>
            <li>{t('help.authorization.foreignPc.forgot', 'Если вы забыли выйти из аккаунта на чужом устройстве, перейдите по ссылке Выйти на всех устройствах в разделе Устройства и установите новый пароль, который сложно подобрать.')}</li>
          </ul>
        </section>
      </div>
    </HelpArticlePage>
  );
};

export default AuthorizationHelpPage;

