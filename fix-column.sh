#!/bin/bash
docker exec loginus-db-prod psql -U loginus -d loginus_prod <<EOF
-- Проверяем существование колонки
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'primaryRecoveryMethod'
    ) THEN
        -- Если колонка не существует, создаем её
        ALTER TABLE users ADD COLUMN "primaryRecoveryMethod" VARCHAR(20) DEFAULT 'email';
        RAISE NOTICE 'Column primaryRecoveryMethod created';
    ELSE
        RAISE NOTICE 'Column primaryRecoveryMethod already exists';
    END IF;
END
\$\$;
EOF

