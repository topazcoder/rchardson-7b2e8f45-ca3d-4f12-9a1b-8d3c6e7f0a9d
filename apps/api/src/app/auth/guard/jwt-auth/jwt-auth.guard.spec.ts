import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Partial<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(reflector as Reflector);
  });

  function makeCtx(): ExecutionContext {
    return ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown) as ExecutionContext;
  }

  it('allows when @Public metadata is true', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const ok = guard.canActivate(makeCtx());
    expect(ok).toBe(true);
  });

  it('handleRequest throws Unauthorized when no user', () => {
    expect(() => guard.handleRequest(undefined, undefined, undefined)).toThrow(UnauthorizedException);
  });
});
