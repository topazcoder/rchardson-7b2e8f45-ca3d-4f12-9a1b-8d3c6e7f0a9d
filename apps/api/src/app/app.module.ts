import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { URL } from 'url';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { Audit } from './entities/audit.entity';
import { OrganizationController } from './organization/organizations.controller';
import { OrganizationService } from './organization/organizations.service';
import { JwtAuthGuard } from './auth/guard/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './auth/guard/roles/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: process.env.DATABASE_URL || undefined,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'totcode123!',
        database: process.env.DB_NAME || 'task_management',
        entities: [User, Organization, Task, Audit],
        synchronize: false,
        migrationsRun: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        ...(function () {
          const url = process.env.DATABASE_URL;
          const schema = process.env.DB_SCHEMA;
          console.log(url, schema);
          if (url) {
            try {
              const parsed = new URL(url);
              const sp = parsed.searchParams.get('search_path');
              if (sp) return { schema: sp };
            } catch (e) {
              throw e;
            }
          }
          if (schema) return { schema };
          return {};
        })(),
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Organization]),
    AuthModule,
    UsersModule,
    TasksModule,
    AuditModule,
  ],
  controllers: [AppController, OrganizationController],
  providers: [AppService, OrganizationService, RolesGuard, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
