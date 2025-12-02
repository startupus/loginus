# 🔑 Инструкция по добавлению Deploy Key

## Шаг 1: Добавьте Deploy Key в GitHub

1. Откройте: https://github.com/teramisuslik/loginus-v2/settings/keys
2. Нажмите **"Add deploy key"**
3. **Title:** `Server Deploy Key`
4. **Key:** Вставьте этот публичный SSH ключ:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHTT9oIftAipQOwB9AiwBmWEXBR5/Jnj0s1LYTqO9NAc saschkaproshka04@mail.ru
```

5. **Allow write access:** можно оставить выключенным (только чтение)
6. Нажмите **"Add key"**

## Шаг 2: После добавления Deploy Key

Выполните на сервере:

```bash
ssh root@45.144.176.42
cd /root/loginus-new
rm -rf * .* 2>/dev/null || true
git clone git@github.com:teramisuslik/loginus-v2.git .
```

Или я могу выполнить это автоматически после того, как вы добавите ключ.

## Альтернатива: GitHub Actions

GitHub Actions уже должен работать и автоматически клонировать репозиторий на сервер при каждом push.

Проверьте статус: https://github.com/teramisuslik/loginus-v2/actions

