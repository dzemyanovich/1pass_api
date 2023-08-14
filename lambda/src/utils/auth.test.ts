import { getToken, validateToken } from './auth';

describe('get and validate token', () => {
  it('returns null', async () => {
    const userId = validateToken('smth');
    expect(userId).toBeNull();
  });

  it('returns user id', async () => {
    const userId = 3;
    const token = getToken(userId);
    const result = validateToken(token);

    expect(result).toBe(userId);
  });
});
