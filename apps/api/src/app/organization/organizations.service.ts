import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../entities/organization.entity';
import {
  OrganizationCreateDto,
  OrganizationUpdateDto,
} from 'libs/data/organization';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  async create(data: OrganizationCreateDto): Promise<Organization> {
    const org = this.organizationRepository.create(data);
    return this.organizationRepository.save(org);
  }

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    data: OrganizationUpdateDto
  ): Promise<Organization | null> {
    await this.organizationRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.organizationRepository.delete(id);
  }

  async findByParentId(parentId: string): Promise<Organization[]> {
    if (parentId === 'null' || parentId === 'undefined') {
      return this.organizationRepository.find({ where: { parentId: null } });
    }
    return this.organizationRepository.find({ where: { parentId } });
  }

  async findParentOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.find({ where: { parentId: null } });
  }
}
