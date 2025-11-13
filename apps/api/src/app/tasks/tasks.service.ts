import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task, TaskStatus } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { CreateTaskDto, taskStatusList } from 'libs/data/task';
import { UsersService } from '../users/users.service';
import {} from 'libs/auth/login';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    private audit: AuditService,
    private users: UsersService
  ) {}

  async create(task: CreateTaskDto, actor: User) {
    try {
      if (actor.role === 'viewer') {
        return { success: false, message: 'Not Permitted' };
      }
      const orgId = await this.users.getOrganizationIdForUser(actor.id);
      const saved = await this.repo.save({
        category: task.category,
        description: task.description,
        title: task.title,
        status: TaskStatus.TODO,
        owner: { id: orgId },
      });
      console.log(saved);
      await this.audit.log('task.create', { taskId: saved.id }, actor);
      return { success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async listForUser(user: User) {
    try {
      const owner = await this.users.getOrganizationIdForUser(user.id);
      console;
      return this.repo.find({ where: { owner: { id: owner } } });
    } catch (error) {
      return {
        message: 'An error occurred while fetching tasks.',
        success: false,
      };
    }
  }

  async update(id: string, data: Partial<Task>, actor: User) {
    try {
      const t = await this.repo.findOne({
        where: { id },
        relations: ['owner'],
      });
      if (!t) throw new ForbiddenException('Not found');
      // Only allow viewers to update tasks in their own organization.
      if (actor.role === 'viewer' && t.owner?.id !== actor.organizationId) {
        throw new ForbiddenException('Not permitted');
      }
      const from = t.status;
      Object.assign(t, data);
      const saved = await this.repo.save(t);
      await this.audit.log(
        'task.update',
        {
          taskId: id,
          title: saved.title,
          from: taskStatusList[from],
          to: taskStatusList[saved.status],
        },
        actor
      );
      return saved;
    } catch (error) {
      return {
        message: 'An error occurred while updating the task.',
        success: false,
      };
    }
  }

  async remove(id: string, actor: User) {
    const t = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    try {
      if (!t) throw new ForbiddenException('Not found');
      if (actor.role === 'viewer' && t.owner?.id !== actor.organizationId)
        throw new ForbiddenException('Not permitted');
      await this.repo.remove(t);
      await this.audit.log('task.delete', { taskId: id }, actor);
      return { ok: true };
    } catch (error) {
      return {
        message: 'An error occurred while deleting the task.',
        success: false,
      };
    }
  }
}
