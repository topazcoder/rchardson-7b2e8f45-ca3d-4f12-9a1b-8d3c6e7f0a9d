import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validate should return id/username/role', async () => {
    const mockConfig: any = { get: () => 'secret' };
    const s = new JwtStrategy(mockConfig as any);
    const payload = { id: 'u1', username: 'alice', role: 'owner' };
    const out = await s.validate(payload as any);
    expect(out).toEqual({ id: 'u1', username: 'alice', role: 'owner' });
  });
});
