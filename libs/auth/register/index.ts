import { Role } from 'apps/api/src/app/entities/user.entity';

export type RegisterUserDto = {
  username: string;
  password: string;
  email: string;
  organizationName?: string;
  parentOrganizationId?: string;
  role: Role;
};
