import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role, default: Role.VIEWER })
  role!: Role;

  @ManyToOne(() => Organization, (o) => o.users, { nullable: true })
  organization!: Organization;

  get organizationId(): string {
    return this.organization?.id ?? '';
  }
}
