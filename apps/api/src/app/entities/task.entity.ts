import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  DONE = 2,
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', default: TaskStatus.TODO })
  status!: number;

  // Owner is the organization that owns the task. Store as a relation to Organization.
  @ManyToOne(() => Organization, (o) => o.tasks, { nullable: true })
  owner!: Organization;

  @Column({ nullable: true })
  category?: string;
}
