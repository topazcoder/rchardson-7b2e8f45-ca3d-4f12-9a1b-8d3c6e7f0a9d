import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorator/public.decorator';

import { RegisterUserDto } from 'libs/auth/register';
import { ResponseData } from 'libs/data/response';
import { AccessTokenResponse, LoginDto } from 'libs/auth';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { OrganizationService } from '../organization/organizations.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly organizations: OrganizationService
  ) {}

  @Post('login')
  @Public()
  async login(
    @Body() body: LoginDto
  ): Promise<ResponseData<AccessTokenResponse | null>> {
    try {
      const user = await this.auth.validateUser(body.email, body.password);
      if (!user) {
        return { data: null, success: false, message: 'Invalid credentials' };
      }
      const token = await this.auth.login(user);
      return { data: token, success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Auth login error', error);
      const msg = error instanceof Error ? error.message : String(error);
      return {
        data: null,
        success: false,
        message: msg || 'An error occurred during login',
      };
    }
  }

  @Post('register')
  @Public()
  async register(
    @Body() body: RegisterUserDto
  ): Promise<ResponseData<AccessTokenResponse | null>> {
    try {
      // simple uniqueness checks
      let existing = await this.users.findByEmail(body.email);
      if (existing) {
        return {
          data: null,
          success: false,
          message: 'User with this email already exists',
        };
      }

      existing = await this.users.findByName(body.username);
      if (existing) {
        return {
          data: null,
          success: false,
          message: 'User with this username already exists',
        };
      }

      // Normalize parentOrganizationId: treat '0', empty string, or missing as null
      const parentId =
        body.parentOrganizationId && body.parentOrganizationId !== '0'
          ? body.parentOrganizationId
          : null;

      let orgId = parentId;
      if (body.role === 'owner') {
        const org = await this.organizations.create({
          name: body.organizationName,
          parentId,
        });
        orgId = org.id;
      }

      const u = await this.users.create(
        body.username,
        body.password,
        body.email,
        body.role,
        orgId
      );

      const token = await this.auth.login(u);
      return { data: token, success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Auth register error', error);
      const msg = error instanceof Error ? error.message : String(error);
      return {
        data: null,
        success: false,
        message: msg || 'An error occurred during registration',
      };
    }
  }
}
