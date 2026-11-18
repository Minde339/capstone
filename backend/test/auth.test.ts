import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Authentication API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  it('should register a new user successfully and grant welcome gift points', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: `newuser_${Date.now()}@test.com`,
        password: 'Password123!',
        fullName: 'Jane Doe',
        phone: '+1-555-9999',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.token).toBeDefined();
    expect(body.user.fullName).toBe('Jane Doe');
    expect(body.user.giftPoints).toBe(100);
  });

  it('should reject registration if email is already taken', async () => {
    const email = `unique_${Date.now()}@test.com`;
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'Password123!',
        fullName: 'First Register',
      },
    });

    const res2 = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'Password123!',
        fullName: 'Second Register',
      },
    });

    expect(res2.statusCode).toBe(400);
    const body = JSON.parse(res2.body);
    expect(body.message).toContain('already registered');
  });

  it('should log in existing demo user with valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'john.doe@example.com',
        password: 'Password123!',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('john.doe@example.com');
  });

  it('should reject login with wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'john.doe@example.com',
        password: 'WrongPassword!',
      },
    });

    expect(res.statusCode).toBe(401);
  });

  it('should retrieve authenticated user profile via /api/auth/me', async () => {
    // 1. Login
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'john.doe@example.com',
        password: 'Password123!',
      },
    });
    const { token } = JSON.parse(loginRes.body);

    // 2. Fetch profile
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const profile = JSON.parse(meRes.body);
    expect(profile.email).toBe('john.doe@example.com');
    expect(profile.fullName).toBe('John Doe');
  });
});
