# 🎯 НАЙДЕНА НАСТОЯЩАЯ ПРОБЛЕМА!

## ❌ **Корневая причина:**

В `frontend/src/services/api/client.ts` (строка 8-10):

```typescript
headers: {
  'Content-Type': 'application/json',  // ❌ ПЕРЕЗАПИСЫВАЕТ multipart/form-data!
},
```

**Что происходило:**
1. Frontend создаёт `FormData` с файлом
2. Axios ДОЛЖЕН установить `Content-Type: multipart/form-data; boundary=...`
3. НО! Axios видит что `Content-Type` **УЖЕ установлен** в `application/json`
4. Axios **НЕ меняет** заголовок
5. Backend получает запрос с `Content-Type: application/json` вместо `multipart/form-data`
6. Multer **НЕ обрабатывает** запрос (т.к. не multipart)
7. Body parser парсит как JSON → файл становится пустым объектом `{}`

---

## ✅ **Исправление:**

Добавил проверку в интерсептор:

```typescript
// ВАЖНО: Удаляем Content-Type для FormData - Axios установит правильный заголовок с boundary
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];
  console.log('[API Client] FormData detected - Content-Type removed for automatic boundary');
}
```

Теперь Axios **СМОЖЕТ** установить правильный `multipart/form-data` заголовок!

---

## 🧪 **ПОПРОБУЙТЕ СЕЙЧАС:**

Frontend обновлён! Перезагрузите страницу и попробуйте загрузить плагин:

1. Откройте: `http://localhost:3000/ru/admin/extensions/plugins/upload`
2. Заполните форму
3. Выберите `.zip` файл
4. Нажмите "Загрузить плагин"

---

## 📊 **В консоли браузера должно появиться:**

```
[API Client] FormData detected - Content-Type removed for automatic boundary
```

И в логах backend должно быть:
```
[ExtensionsController] file: FILE RECEIVED
```

**Теперь точно должно работать! 🚀**

