import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Bill } from '../entities/Bill';
import { BillTick } from '../entities/BillTick';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Bill, BillTick],
  synchronize: true,
  logging: false,
});