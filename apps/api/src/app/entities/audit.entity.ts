import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ type: 'json', nullable: true })
  meta?: Record<string, unknown> | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actorId' })
  actor?: User;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'orgId' })
  orgId?: Organization;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
