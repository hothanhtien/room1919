import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

@Entity('bill_ticks')
export class BillTick {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bill_id!: string;

  @Column()
  user_id!: string;

  @CreateDateColumn()
  ticked_at!: Date;

  @ManyToOne(() => Bill, (bill) => bill.ticks)
  @JoinColumn({ name: 'bill_id' })
  bill!: Bill;

  @ManyToOne(() => User, (user) => user.ticks)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}