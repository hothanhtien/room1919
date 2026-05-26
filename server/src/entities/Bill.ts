import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { BillTick } from './BillTick';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  creator_id!: string;

  @ManyToOne(() => User, (user) => user.bills)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => BillTick, (tick) => tick.bill)
  ticks!: BillTick[];
}