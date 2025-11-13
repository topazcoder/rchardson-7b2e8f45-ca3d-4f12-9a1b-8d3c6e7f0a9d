import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './app/entities/user.entity';
import { Organization } from './app/entities/organization.entity';
import { Task } from './app/entities/task.entity';
import { Audit } from './app/entities/audit.entity';

const host = process.env.DB_HOST ?? 'localhost';
const port = parseInt(process.env.DB_PORT ?? '5432');
const username = process.env.DB_USER ?? 'postgres';
const password = process.env.DB_PASS ?? 'postgres';
const database = process.env.DB_NAME ?? 'task_management';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [User, Organization, Task, Audit],
  migrations: [__dirname + '/app/migrations/*{.ts,.js}'],
});

export default AppDataSource;
