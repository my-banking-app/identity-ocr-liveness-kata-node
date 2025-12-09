import { AuthService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  const email = 'user@example.com';
  const password = 'secret123';
  const name = 'User';

  it('register should create user and prevent duplicates', async () => {
    const user = await AuthService.register({ email, password, name });
    expect(user.email).toBe(email);
    await expect(AuthService.register({ email, password, name }))
      .rejects.toThrow('User already exists');
  });

  it('login should return tokens and user', async () => {
    const res = await AuthService.login({ email, password });
    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(res.user.email).toBe(email);
  });

  it('login should fail with invalid credentials', async () => {
    await expect(AuthService.login({ email, password: 'bad' }))
      .rejects.toThrow('Invalid credentials');
  });

  it('refreshToken should return new accessToken and logout should revoke', async () => {
    const { refreshToken } = await AuthService.login({ email, password });
    const newAccess = await AuthService.refreshToken(refreshToken);
    expect(newAccess).toBeTruthy();
    await AuthService.logout(refreshToken);
    await expect(AuthService.refreshToken(refreshToken))
      .rejects.toThrow('Invalid refresh token');
  });
});

