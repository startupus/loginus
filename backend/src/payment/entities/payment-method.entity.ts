import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentMethodType = 'card' | 'bank_account';
export type PaymentMethodStatus = 'active' | 'inactive';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  type: PaymentMethodType;

  @Column({ type: 'varchar', length: 255 })
  bankName: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  lastFour: string | null;

  @Column({ type: 'varchar', length: 34, nullable: true })
  accountNumber: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  expiryDate: string | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: PaymentMethodStatus;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

