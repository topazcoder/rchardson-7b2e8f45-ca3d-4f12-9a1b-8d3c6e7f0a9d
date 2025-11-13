import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtPayload } from 'libs/auth';

import { AuditService } from './audit.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/roles/roles.guard';
import { Role } from '../entities/user.entity';

@Controller('audit-log')
@UseGuards(RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  async list(@Req() req: Request & { user?: JwtPayload }) {
    try {
      const orgId = req.user?.organizationId ?? null;
      if (orgId) {
        return this.audit.listForOrganization(orgId);
      }
      return this.audit.list();
    } catch (error) {
      return {
        message: 'An error occurred while fetching audit logs.',
        success: false,
      };
    }
  }
}
