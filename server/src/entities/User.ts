import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bill } from './Bill';
import { BillTick } from './BillTick';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Bill, (bill) => bill.creator)
  bills!: Bill[];

  @OneToMany(() => BillTick, (tick) => tick.user)
  ticks!: BillTick[];
}