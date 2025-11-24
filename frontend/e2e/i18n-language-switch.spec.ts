/**
 * E2E тесты для проверки смены языка
 * Проверяет работу переключения языка на различных страницах
 */

import { test, expect } from '@playwright/test';

test.describe('i18n Language Switch', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('http://localhost:3000/ru/dashboard');
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
  });

  test('should render English resources on direct /en/dashboard load', async ({ page }) => {
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.removeItem('loginus-language');
      sessionStorage?.clear();
    });

    await page.goto('http://localhost:3000/en/dashboard');
    await page.waitForLoadState('networkidle');

    const sidebarNav = page.locator('nav');
    await expect(sidebarNav.locator('text=Support')).toBeVisible({ timeout: 3000 });
    await expect(sidebarNav.locator('text=Поддержка')).toHaveCount(0);

    await expect(page.locator('text=Documents')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=personalData.documents.title')).toHaveCount(0);
  });

  test('should switch language from RU to EN on dashboard page', async ({ page }) => {
    // Проверяем, что страница на русском
    await expect(page.locator('text=Профиль').or(page.locator('text=Profile'))).toBeVisible();
    
    // Находим переключатель языка в Sidebar
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await expect(languageSwitcher).toBeVisible();
    
    // Кликаем на переключатель языка
    await languageSwitcher.click();
    
    // Ждем переключения языка и обновления URL
    await page.waitForURL(/\/en\/dashboard/, { timeout: 5000 });
    
    // Проверяем, что URL изменился на английский
    expect(page.url()).toContain('/en/dashboard');
    
    // Проверяем, что элементы переведены на английский
    // Sidebar должен показывать английские названия
    await expect(page.locator('text=Profile')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Data')).toBeVisible();
  });

  test('should switch language from EN to RU on dashboard page', async ({ page }) => {
    // Переходим на английскую версию
    await page.goto('http://localhost:3000/en/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что страница на английском
    await expect(page.locator('text=Profile')).toBeVisible();
    
    // Находим переключатель языка
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await expect(languageSwitcher).toBeVisible();
    
    // Кликаем на переключатель языка
    await languageSwitcher.click();
    
    // Ждем переключения языка
    await page.waitForURL(/\/ru\/dashboard/, { timeout: 5000 });
    
    // Проверяем, что URL изменился на русский
    expect(page.url()).toContain('/ru/dashboard');
    
    // Проверяем, что элементы переведены на русский
    await expect(page.locator('text=Профиль')).toBeVisible({ timeout: 3000 });
  });

  test('should translate sidebar items when language changes', async ({ page }) => {
    // Начинаем с русской версии
    await page.goto('http://localhost:3000/ru/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Проверяем русские названия в Sidebar
    await expect(page.locator('text=Профиль')).toBeVisible();
    await expect(page.locator('text=Данные')).toBeVisible();
    await expect(page.locator('text=Безопасность')).toBeVisible();
    
    // Переключаем на английский
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await languageSwitcher.click();
    await page.waitForURL(/\/en\/dashboard/, { timeout: 5000 });
    
    // Проверяем английские названия
    await expect(page.locator('text=Profile')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should translate footer when language changes', async ({ page }) => {
    await page.goto('http://localhost:3000/ru/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Прокручиваем вниз к Footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Проверяем русский текст в Footer
    await expect(page.locator('text=Loginus')).toBeVisible();
    await expect(page.locator('text=Справка')).toBeVisible();
    
    // Переключаем на английский
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await languageSwitcher.click();
    await page.waitForURL(/\/en\/dashboard/, { timeout: 5000 });
    
    // Прокручиваем снова
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Проверяем английский текст в Footer
    await expect(page.locator('text=Loginus')).toBeVisible();
    await expect(page.locator('text=Help')).toBeVisible({ timeout: 3000 });
  });

  test('should translate admin page when language changes', async ({ page }) => {
    // Переходим на админ-страницу
    await page.goto('http://localhost:3000/ru/admin/backup');
    await page.waitForLoadState('networkidle');
    
    // Проверяем русские названия в админ-сайдбаре
    await expect(page.locator('text=Резервное копирование').or(page.locator('text=Backup'))).toBeVisible();
    
    // Переключаем на английский
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await languageSwitcher.click();
    await page.waitForURL(/\/en\/admin\/backup/, { timeout: 5000 });
    
    // Проверяем английские названия
    await expect(page.locator('text=Backup')).toBeVisible({ timeout: 3000 });
  });

  test('should preserve current page when switching language', async ({ page }) => {
    // Переходим на страницу данных
    await page.goto('http://localhost:3000/ru/data');
    await page.waitForLoadState('networkidle');
    
    // Переключаем язык
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await languageSwitcher.click();
    
    // Проверяем, что остались на той же странице, но с другим языком
    await page.waitForURL(/\/en\/data/, { timeout: 5000 });
    expect(page.url()).toContain('/en/data');
    expect(page.url()).not.toContain('/ru/data');
  });

  test('should format numbers and dates according to language on dashboard', async ({ page }) => {
    // Переходим на русскую версию dashboard
    await page.goto('http://localhost:3000/ru/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что числа форматируются в русском стиле (пробелы как разделители тысяч)
    // Ищем баланс в ProfileCard - должен быть форматирован как "12 500 ₽" (с пробелами)
    const balanceRu = page.locator('text=/\\d+\\s+\\d+\\s*₽/').first();
    await expect(balanceRu).toBeVisible({ timeout: 3000 });
    
    // Переключаем на английский
    const languageSwitcher = page.locator('button:has-text("RU"), button:has-text("EN")').first();
    await languageSwitcher.click();
    await page.waitForURL(/\/en\/dashboard/, { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что числа форматируются в английском стиле (запятые как разделители тысяч)
    // Баланс должен быть форматирован как "12,500 ₽" (с запятыми)
    const balanceEn = page.locator('text=/\\d+,\\d+\\s*₽/').first();
    await expect(balanceEn).toBeVisible({ timeout: 3000 });
  });

  test('should render support page in English without Russian artefacts', async ({ page }) => {
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.removeItem('loginus-language');
      sessionStorage?.clear();
    });

    await page.goto('http://localhost:3000/en/support');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('text=Loginus Support')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Hello! I will help you with questions about Loginus ID.')).toBeVisible();

    await expect(page.locator('text=Поддержка')).toHaveCount(0);
    await expect(page.locator('text=Здравствуйте!')).toHaveCount(0);
  });

  test('should not flash English text before switching to Russian on initial load', async ({ page }) => {
    // Переходим на русскую версию dashboard
    await page.goto('http://localhost:3000/ru/dashboard');
    
    // Ждем загрузки, но проверяем сразу - не должно быть английского текста
    await page.waitForLoadState('domcontentloaded');
    
    // Проверяем, что сразу виден русский текст в Sidebar
    // Если есть мигание, то сначала появится английский, потом русский
    const sidebarProfile = page.locator('text=Профиль');
    await expect(sidebarProfile).toBeVisible({ timeout: 2000 });
    
    // Убеждаемся, что английский текст НЕ появляется
    const sidebarProfileEn = page.locator('text=Profile');
    await expect(sidebarProfileEn).not.toBeVisible({ timeout: 1000 });
  });
});

