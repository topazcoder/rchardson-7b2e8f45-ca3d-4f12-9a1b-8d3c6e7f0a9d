import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { User } from './user.entity';
import { Task } from './task.entity';

@Entity({ name: 'organization' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: false })
  name!: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  @OneToMany(() => Task, (t) => t.owner)
  tasks!: Task[];
}
