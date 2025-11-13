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
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CreateTaskDto } from 'libs/data/task';
import { JwtPayload } from 'libs/auth';

import { TasksService } from './tasks.service';
import { UsersService } from '../users/users.service';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasks: TasksService, private users: UsersService) {}

  @Post()
  create(
    @Body() body: CreateTaskDto,
    @Req() req: Request & { user?: JwtPayload }
  ) {
    try {
      return this.tasks.create(body, req.user as any);
    } catch (error) {
      return {
        message: 'An error occurred while creating the task.',
        success: false,
      };
    }
  }

  @Get()
  list(@Req() req: Request & { user?: JwtPayload }) {
    try {
      return this.tasks.listForUser(req.user as any);
    } catch (error) {
      return {
        message: 'An error occurred while fetching tasks.',
        success: false,
      };
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateTaskDto>,
    @Req() req: Request & { user?: JwtPayload }
  ) {
    try {
      return this.tasks.update(id, body as any, req.user as any);
    } catch (error) {
      return {
        message: 'An error occurred while updating the task.',
        success: false,
      };
    }
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request & { user?: JwtPayload }) {
    try {
      return this.tasks.remove(id, req.user as any);
    } catch (error) {
      return {
        message: 'An error occurred while deleting the task.',
        success: false,
      };
    }
  }
}
