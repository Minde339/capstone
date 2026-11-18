import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Cart API', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // Login demo user
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'alice.smith@example.com',
        password: 'Password123!',
      },
    });
    token = JSON.parse(res.body).token;
  });

  it('should get empty cart initially for user', async () => {
    // Clear first to ensure clean state
    await app.inject({
      method: 'DELETE',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const cart = JSON.parse(res.body);
    expect(cart.items.length).toBe(0);
    expect(cart.subtotal).toBe(0);
  });

  it('should add item to cart', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        bookId: 'book-2',
        quantity: 2,
      },
    });

    expect(res.statusCode).toBe(200);
    const cart = JSON.parse(res.body);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].bookId).toBe('book-2');
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.subtotal).toBe(518.00);
  });

  it('should update item quantity', async () => {
    // Get current cart to get itemId
    const getRes = await app.inject({
      method: 'GET',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });
    const cart = JSON.parse(getRes.body);
    const itemId = cart.items[0].id;

    const res = await app.inject({
      method: 'PUT',
      url: `/api/cart/items/${itemId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        quantity: 3,
      },
    });

    expect(res.statusCode).toBe(200);
    const updated = JSON.parse(res.body);
    expect(updated.items[0].quantity).toBe(3);
  });

  it('should remove item from cart', async () => {
    const getRes = await app.inject({
      method: 'GET',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });
    const cart = JSON.parse(getRes.body);
    const itemId = cart.items[0].id;

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/cart/items/${itemId}`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const updated = JSON.parse(res.body);
    expect(updated.items.length).toBe(0);
  });
});
