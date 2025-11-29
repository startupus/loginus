# ✅ ОШИБКА ИСПРАВЛЕНА!

## ❌ **Проблема:**

```typescript
error TS2304: Cannot find name 'dto'.
```

Я заменил `dto` на `body`, но забыл заменить в строках 106-107!

---

## ✅ **Исправлено:**

```typescript
// ❌ БЫЛО:
if (dto.enabled !== undefined && result.success && result.extensionId) {
  await this.registry.update(result.extensionId, { enabled: dto.enabled });
}

// ✅ СЕЙЧАС:
if (enabled !== undefined && result.success && result.extensionId) {
  await this.registry.update(result.extensionId, { enabled: enabled });
}
```

---

## 🧪 **ПОПРОБУЙТЕ СНОВА:**

**Backend автоматически перекомпилируется!**

1. Подождите ~10 секунд
2. Откройте: `http://localhost:3000/ru/admin/extensions/plugins/upload`
3. Заполните форму
4. Нажмите "Загрузить плагин"

**Теперь должно работать! 🚀**

