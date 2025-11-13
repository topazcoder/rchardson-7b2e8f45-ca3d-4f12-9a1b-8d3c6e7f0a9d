import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OrganizationModule } from '../organization/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => OrganizationModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
