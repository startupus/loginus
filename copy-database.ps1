# Скрипт для копирования локальной БД на сервер (Windows)

$ErrorActionPreference = "Stop"

Write-Host "📦 Создание дампа локальной БД..." -ForegroundColor Cyan

# Параметры локальной БД
$LOCAL_DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$LOCAL_DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$LOCAL_DB_NAME = if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "loginus_dev" }
$LOCAL_DB_USER = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "loginus" }
$LOCAL_DB_PASS = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "loginus_secret" }

# Имя файла дампа
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DUMP_FILE = "loginus_db_dump_$timestamp.dump"

Write-Host "Создаю дамп базы данных $LOCAL_DB_NAME..." -ForegroundColor Yellow

# Проверяем, запущен ли контейнер
$containerName = "loginus-db"
$containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^$containerName$"

if ($containerRunning) {
    Write-Host "Контейнер $containerName найден, создаю дамп через Docker..." -ForegroundColor Green
    
    # Создаем дамп через Docker
    docker exec $containerName pg_dump -U $LOCAL_DB_USER -d $LOCAL_DB_NAME -F c -f /tmp/loginus_dump.dump
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при создании дампа" -ForegroundColor Red
        exit 1
    }
    
    # Копируем дамп из контейнера
    docker cp "$containerName`:/tmp/loginus_dump.dump" $DUMP_FILE
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка при копировании дампа из контейнера" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Контейнер не найден, пытаюсь подключиться напрямую..." -ForegroundColor Yellow
    
    # Пытаемся создать дамп напрямую (если pg_dump установлен локально)
    $env:PGPASSWORD = $LOCAL_DB_PASS
    pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME -F c -f $DUMP_FILE
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ошибка: не удалось создать дамп. Убедитесь, что:" -ForegroundColor Red
        Write-Host "   1. Контейнер loginus-db запущен, или" -ForegroundColor Red
        Write-Host "   2. pg_dump установлен локально и доступен в PATH" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $DUMP_FILE)) {
    Write-Host "❌ Ошибка: дамп не создан" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $DUMP_FILE).Length / 1MB
Write-Host "✅ Дамп создан: $DUMP_FILE (размер: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green

Write-Host "📤 Копирую на сервер..." -ForegroundColor Cyan

# Копируем на сервер
$sshKey = "$env:USERPROFILE\.ssh\id_ed25519"
scp -i $sshKey $DUMP_FILE root@45.144.176.42:/tmp/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при копировании на сервер" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Дамп скопирован на сервер: /tmp/$DUMP_FILE" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Для восстановления на сервере выполните:" -ForegroundColor Cyan
Write-Host "   ssh -i $sshKey root@45.144.176.42" -ForegroundColor Yellow
Write-Host "   docker exec -i loginus-db-prod pg_restore -U loginus -d loginus_prod -c --if-exists < /tmp/$DUMP_FILE" -ForegroundColor Yellow
Write-Host ""
Write-Host "Или используйте скрипт restore-database.sh на сервере" -ForegroundColor Yellow

