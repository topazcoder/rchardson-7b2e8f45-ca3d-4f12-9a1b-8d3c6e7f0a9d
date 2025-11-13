import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

import { User, Role } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(
    username: string,
    password: string,
    email: string,
    role: Role = Role.VIEWER,
    organizationId: string
  ): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    const u = this.repo.create({
      username,
      passwordHash: hash,
      email,
      role,
      organization: { id: organizationId },
    });

    return this.repo.save(u);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByName(username: string) {
    return this.repo.findOne({
      where: { username },
      relations: ['organization'],
    });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Return only the organization id for a given user without loading the full relation.
   * This is efficient when you only need the FK and not the whole Organization entity.
   */
  async getOrganizationIdForUser(userId: string): Promise<string | null> {
    const raw = await this.repo
      .createQueryBuilder('user')
      .leftJoin('user.organization', 'org')
      .where('user.id = :id', { id: userId })
      .select('org.id', 'organizationId')
      .getRawOne<{ organizationId?: string }>();

    return raw?.organizationId ?? null;
  }

  async getOrganizationOwnerIdForUser(userId: string): Promise<string | null> {
    const raw = await this.repo
      .createQueryBuilder('user')
      .leftJoin('user.organization', 'org');
    //   .where('user.id = :id', { id: userId })
    //   .select('org.id', 'organizationId')
    //   .getRawOne<{ organizationId?: string }>();

    // return raw?.organizationId ?? null;

    console.log(raw);

    return null;
  }

  async listByOrganization(organizationId: string) {
    return this.repo.find({ where: { organization: { id: organizationId } } });
  }

  async findOwnerofOrganizationById(organizationId: string) {
    return this.repo.findOne({
      where: { organization: { id: organizationId }, role: Role.OWNER },
    });
  }

  async update(id: string, patch: Partial<User>) {
    const u = await this.findById(id);
    if (!u) return null;
    Object.assign(u, patch);
    return this.repo.save(u);
  }

  async remove(id: string) {
    const u = await this.findById(id);
    if (!u) return null;
    await this.repo.delete(id);
    return { success: true };
  }
}
