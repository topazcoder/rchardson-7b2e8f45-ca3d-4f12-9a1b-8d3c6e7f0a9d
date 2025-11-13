import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  const mockUsers: any = {
    findByEmail: jest.fn(),
    getOrganizationIdForUser: jest.fn().mockResolvedValue(null),
  };
  const mockJwt: any = {
    sign: jest.fn().mockReturnValue('token123'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsers },
        { provide: JwtService, useValue: mockJwt },
      ],
    })
      // Nest's DI token name may differ; override below by setting the properties after module compilation
      .compile();

    service = module.get(AuthService);
    // Inject mocks (since AuthService expects UsersService and JwtService by type, but our simple test uses property assignment)
    // @ts-ignore
    service['users'] = mockUsers;
    // @ts-ignore
    service['jwt'] = mockJwt;
  });

  it('login returns accessToken', async () => {
    const out = await service.login({
      id: 'u1',
      username: 'a',
      role: 'owner',
    } as any);
    expect(out).toEqual({ accessToken: 'token123' });
    expect(mockJwt.sign).toHaveBeenCalledWith({
      id: 'u1',
      username: 'a',
      role: 'owner',
      organizationId: null,
    });
  });

  it('validateUser returns null when user not found', async () => {
    mockUsers.findByEmail.mockResolvedValue(null);
    const out = await service.validateUser('x', 'p');
    expect(out).toBeNull();
  });

  it('validateUser returns user when password matches', async () => {
    // create a real bcrypt hash for the password so compare will succeed
    const pwHash = await (bcrypt as any).hash('p', 1);
    const user = { id: 'u1', passwordHash: pwHash };
    mockUsers.findByEmail.mockResolvedValue(user);
    const out = await service.validateUser('x', 'p');
    expect(out).toEqual(user);
  });
});
