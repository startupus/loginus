import { DataSource } from 'typeorm';
import { join } from 'path';

// Определяем формат исходников по расширению текущего файла:
// если конфиг выполняется через ts-node, __filename заканчивается на .ts.
// В собранном dist используется .js.
const isTsEnv = __filename.endsWith('.ts');

const fileExtension = isTsEnv ? 'ts' : 'js';
const migrationsGlob = join(__dirname, '..', 'database', 'migrations', `*.${fileExtension}`);
const entitiesGlob = join(__dirname, '..', '**', `*.entity.${fileExtension}`);

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'loginus',
  password: process.env.DB_PASSWORD || 'loginus_secret',
  database: process.env.DB_DATABASE || 'loginus_dev',
  migrations: [migrationsGlob],
  entities: [entitiesGlob],
  synchronize: false,
  logging: false,
});
