import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { OrganizationService } from '../organization/organizations.service';
import { Role } from '../entities/user.entity';
import { Request } from 'express';
import { JwtPayload } from 'libs/auth';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
@Roles(Role.OWNER, Role.ADMIN, Role.VIEWER)
export class UsersController {
  constructor(
    private users: UsersService,
    private organizations: OrganizationService
  ) {}

  @Get()
  async list(@Req() req: Request & { user?: JwtPayload }) {
    try {
      const userId = req.user?.id;
      const orgId = await this.users.getOrganizationIdForUser(userId!);

      if (!orgId) return { error: 'Organization not found on user' };
      return await this.users.listByOrganization(orgId);
    } catch (error) {
      return {
        message: 'An error occurred while fetching users.',
        success: false,
      };
    }
  }

  @Get('me')
  async me(@Req() req: Request & { user?: JwtPayload }) {
    try {
      const userId = req.user?.id;
      if (!userId) return { error: 'Unauthenticated' };
      const u = await this.users.findById(userId);
      if (!u) return { message: 'User not found', success: false };

      try {
        const orgId = await this.users.getOrganizationIdForUser(userId);
        if (orgId) {
          const org = await this.organizations.findOne(orgId);
          if (org) u.organization = org;
        }
      } catch (err) {}

      return u;
    } catch (error) {
      return {
        message: 'An error occurred while fetching user.',
        success: false,
      };
    }
  }

  @Post()
  async create(
    @Body()
    body: { username: string; password: string; email?: string; role?: Role },
    @Req() req: Request & { user?: JwtPayload }
  ) {
    try {
      const orgId = await this.users.getOrganizationIdForUser(req.user!.id);
      if (!orgId) return { error: 'Organization not found on user' };
      const { username, password, email, role } = body;
      const userRole = role || Role.VIEWER;
      const created = await this.users.create(
        username,
        password,
        email,
        userRole,
        orgId
      );
      return created;
    } catch (error) {
      return {
        message: 'An error occurred while creating user.',
        success: false,
      };
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { username?: string; email?: string; role?: Role },
    @Req() req: Request & { user?: JwtPayload }
  ) {
    try {
      // only allow role/email/username updates here
      const patch: Partial<{ username?: string; email?: string; role?: Role }> =
        {};
      if (body.role) patch.role = body.role;
      if (body.email) patch.email = body.email;
      if (body.username) patch.username = body.username;
      const updated = await this.users.update(id, patch);
      return updated || { message: 'User not found', success: false };
    } catch (error) {
      return {
        message: 'An error occurred while updating user.',
        success: false,
      };
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: Request & { user?: JwtPayload }
  ) {
    try {
      return await this.users.remove(id);
    } catch (error) {
      return {
        message: 'An error occurred while deleting user.',
        success: false,
      };
    }
  }
}
