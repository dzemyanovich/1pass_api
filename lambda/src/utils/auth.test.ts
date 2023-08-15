import { getToken, getUserId } from './auth';

describe('auth token', () => {
  it('returns null', async () => {
    const userId = getUserId('smth');
    expect(userId).toBeNull();
  });

  it('returns user id', async () => {
    const userId = 3;
    const token = getToken(userId);
    const result = getUserId(token);

    expect(result).toBe(userId);
  });
});
