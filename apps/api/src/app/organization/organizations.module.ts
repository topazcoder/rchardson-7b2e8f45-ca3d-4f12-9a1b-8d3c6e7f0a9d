import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationService } from './organizations.service';
import { OrganizationController } from './organizations.controller';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { Organization } from '../entities/organization.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), forwardRef(() => UsersModule), AuditModule],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
