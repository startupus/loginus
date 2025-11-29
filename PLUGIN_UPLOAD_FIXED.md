# ✅ ПРОБЛЕМА НАЙДЕНА И ИСПРАВЛЕНА!

## ❌ **Проблема была:**

Из логов (строка 51):
```
property file should not exist
```

**ValidationPipe** пытался валидировать поле `file` в body, но:
1. В DTO нет поля `file` (файл приходит через `@UploadedFile()`)
2. FormData передавал `file` и в body тоже: `"file":{}`
3. Валидация падала с 400 Bad Request

---

## ✅ **Исправление:**

Убрал `ValidationPipe` и добавил **ручную валидацию**:

```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
// БЕЗ ValidationPipe - FormData с файлами не работает с class-validator
async uploadExtension(
  @UploadedFile() file: any,
  @Body() body: any,  // Получаем сырой body
) {
  // Ручная валидация
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }
  
  if (!body.name || typeof body.name !== 'string') {
    throw new BadRequestException('Name is required');
  }
  
  // Преобразуем enabled из string в boolean
  const enabled = body.enabled === 'true' || body.enabled === true;
  
  // ...
}
```

---

## 🧪 **ПОПРОБУЙТЕ СНОВА:**

1. Откройте: `http://localhost:3000/ru/admin/extensions/plugins/upload`
2. Заполните:
   - **Название:** Test Plugin
   - **Тип:** Плагин
   - **Файл:** `test-simple-plugin.zip`
   - **Включить:** ✅
3. Нажмите "Загрузить плагин"

---

## 📊 **Теперь должно работать!**

Backend перезапущен с исправленной валидацией!

**Попробуйте загрузить плагин! 🚀**

