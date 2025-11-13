import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../../entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Partial<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as Reflector);
  });

  function makeCtx(user?: any): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  it('allows when no roles required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const ok = guard.canActivate(makeCtx({ role: 'viewer' }));
    expect(ok).toBe(true);
  });

  it('throws Forbidden when no user present', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.OWNER]);
    expect(() => guard.canActivate(makeCtx(undefined))).toThrow(
      ForbiddenException
    );
  });

  it('allows when user role matches required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.OWNER]);
    const ok = guard.canActivate(makeCtx({ role: Role.OWNER }));
    expect(ok).toBe(true);
  });

  it('throws Forbidden when role does not match', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);
    expect(() => guard.canActivate(makeCtx({ role: Role.VIEWER }))).toThrow(
      ForbiddenException
    );
  });
});
