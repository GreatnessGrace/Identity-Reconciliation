import { DataSource } from 'typeorm';
import { Contact } from './entity/contact';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST,
  port: 13236,
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: true,
  logging: true,
  entities: [Contact],
  migrations: [],
  subscribers: [],
});
