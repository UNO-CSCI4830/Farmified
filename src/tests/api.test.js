import { login } from '../utils/api';

describe('login (sign-in) API utility', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('1) sends POST /login with email & password and returns data on success', async () => {
    const mockResponseData = { token: 'abc123', userId: 'user-1' };

    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(mockResponseData),
    });

    const result = await login('test@example.com', 'password123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/login$/),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      }
    );

    expect(result).toEqual(mockResponseData);
  });

  test('2) throws error when backend returns error JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
    });

    await expect(login('bad@example.com', 'wrong'))
      .rejects.toThrow('Invalid credentials');
  });

  test('3) throws generic error when response has no error field', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(login('user@example.com', 'password'))
      .rejects.toThrow('Login failed: 500 Internal Server Error');
  });

  test('4) throws network error message on fetch failure', async () => {
    global.fetch.mockRejectedValue(new Error('Failed to fetch'));

    await expect(login('user@example.com', 'password'))
      .rejects.toThrow(
        'Cannot connect to server. Make sure the backend is running on http://localhost:5001'
      );
  });
});
