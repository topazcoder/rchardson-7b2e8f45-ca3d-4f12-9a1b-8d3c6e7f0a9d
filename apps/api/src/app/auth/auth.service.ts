import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDto } from 'libs/auth/login';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (ok) return user;
    return null;
  }

  async login(user: UserDto) {
    const orgId = await this.users.getOrganizationIdForUser(user.id);
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      organizationId: orgId,
    };
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    console.log(payload);
    return { accessToken: this.jwt.sign(payload) };
  }
}
