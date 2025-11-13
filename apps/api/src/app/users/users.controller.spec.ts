import { Test, TestingModule } from '@nestjs/testing';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OrganizationService } from '../organization/organizations.service';

describe('UsersController RBAC', () => {
  let controller: UsersController;
  let usersSvc: Partial<UsersService>;

  beforeEach(async () => {
    usersSvc = {
      listByOrganization: jest
        .fn()
        .mockResolvedValue([{ id: 'u1', username: 'alice' }]),
      create: jest.fn().mockResolvedValue({ success: true }),
      update: jest.fn().mockResolvedValue({ success: true }),
      remove: jest.fn().mockResolvedValue({ success: true }),
      findById: jest.fn().mockResolvedValue({ id: 'u1', username: 'alice' }),
      getOrganizationIdForUser: jest.fn().mockImplementation((userId: string) =>
        Promise.resolve(userId === 'withOrg' ? 'org1' : null)
      ),
    };

    const orgSvc: any = {
      findOne: jest.fn().mockResolvedValue({ id: 'org1', name: 'Org' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersSvc },
        { provide: 'OrganizationService', useValue: orgSvc },
        { provide: OrganizationService, useValue: orgSvc },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('returns organization-not-found when user has no organization', async () => {
    const res = await controller.list({ user: { role: 'viewer', id: 'noorg' } } as any);
    expect(res).toEqual({ error: 'Organization not found on user' });
  });

  it('lists users for user with organization', async () => {
    const res = await controller.list({ user: { role: 'owner', id: 'withOrg' } } as any);
    expect(res).toEqual([{ id: 'u1', username: 'alice' }]);
    expect(usersSvc.listByOrganization).toHaveBeenCalledWith('org1');
  });

  it('create returns organization-not-found when user has no org', async () => {
    const res = await controller.create({ username: 'x' } as any, { user: { role: 'viewer', id: 'noorg' } } as any);
    expect(res).toEqual({ error: 'Organization not found on user' });
  });

  it('creates user when organization present', async () => {
    const res = await controller.create({ username: 'bob', password: 'p' } as any, { user: { role: 'owner', id: 'withOrg' } } as any);
    expect(usersSvc.create).toHaveBeenCalled();
    expect(res).toEqual({ success: true });
  });

  it('updates user', async () => {
    const res = await controller.update('u1', { role: 'admin' } as any, { user: { role: 'owner', id: 'withOrg' } } as any);
    expect(usersSvc.update).toHaveBeenCalledWith('u1', expect.objectContaining({ role: 'admin' }));
    expect(res).toEqual({ success: true });
  });

  it('deletes user', async () => {
    const res = await controller.delete('u1', { user: { role: 'owner', id: 'withOrg' } } as any);
    expect(usersSvc.remove).toHaveBeenCalledWith('u1');
    expect(res).toEqual({ success: true });
  });

  it('should return me unauthenticated when no user', async () => {
    const res = await controller.me({} as any);
    expect(res).toEqual({ error: 'Unauthenticated' });
  });

  it('should return me when user present', async () => {
    const res = await controller.me({ user: { id: 'u1' } } as any);
    expect(usersSvc.findById).toHaveBeenCalledWith('u1');
    expect(res).toEqual({ id: 'u1', username: 'alice' });
  });
});
