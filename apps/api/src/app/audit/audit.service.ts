import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Audit } from '../entities/audit.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(Audit) private repo: Repository<Audit>) {}

  async log(
    action: string,
    meta?: Record<string, unknown> | null,
    actor?: User
  ) {
    const a = this.repo.create({ action, meta, actor });
    const saved = await this.repo.save(a);
    // Basic console audit
    console.log('[AUDIT]', action, { meta, actor: actor?.username });
    return saved;
  }

  async list() {
    return this.repo.find({
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }

  async listForOrganization(orgId?: string) {
    // if no orgId provided, return all
    if (!orgId) return this.list();

    // Use query builder to join actor -> organization and filter
    return this.repo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actor', 'actor')
      .leftJoinAndSelect('actor.organization', 'organization')
      .where('organization.id = :orgId', { orgId })
      .orderBy('audit.createdAt', 'DESC')
      .getMany();
  }
}
