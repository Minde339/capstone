import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Orders & Checkout API', () => {
  let app: FastifyInstance;
  let token: string;
  let addressId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();

    // 1. Login demo user
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'john.doe@example.com',
        password: 'Password123!',
      },
    });
    token = JSON.parse(loginRes.body).token;

    // 2. Fetch address
    const addrRes = await app.inject({
      method: 'GET',
      url: '/api/user/addresses',
      headers: { authorization: `Bearer ${token}` },
    });
    const addresses = JSON.parse(addrRes.body);
    addressId = addresses[0].id;
  });

  it('should calculate checkout quote with gift points redemption', async () => {
    // Clear cart first for isolation
    await app.inject({
      method: 'DELETE',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });

    // Add book-5 ($18.99) to cart
    await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      headers: { authorization: `Bearer ${token}` },
      payload: { bookId: 'book-5', quantity: 1 },
    });

    const quoteRes = await app.inject({
      method: 'POST',
      url: '/api/checkout/quote',
      headers: { authorization: `Bearer ${token}` },
      payload: { redeemGiftPoints: 50 }, // $5.00 discount
    });

    expect(quoteRes.statusCode).toBe(200);
    const quote = JSON.parse(quoteRes.body);
    expect(quote.subtotal).toBe(499.00);
    expect(quote.shippingFee).toBe(0.00); // >= $50 free shipping
    expect(quote.giftPointsRedeemed).toBe(50);
    expect(quote.discountAmount).toBe(5.0);
    expect(quote.totalAmount).toBe(494.00); // 499.00 + 0 - 5.00 = 494.00
  });

  it('should place an order, create payment record, and clear cart', async () => {
    const orderRes = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        addressId,
        paymentMethod: 'CREDIT_CARD',
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvc: '123',
        redeemGiftPoints: 50,
      },
    });

    expect(orderRes.statusCode).toBe(201);
    const order = JSON.parse(orderRes.body);
    expect(order.id).toBeDefined();
    expect(order.orderNumber).toContain('EBK-');
    expect(order.status).toBe('PLACED');
    expect(order.payment.paymentMethod).toBe('CREDIT_CARD');
    expect(order.payment.status).toBe('SUCCESS');
    expect(order.canCancel).toBe(true);

    // Verify cart is cleared
    const cartRes = await app.inject({
      method: 'GET',
      url: '/api/cart',
      headers: { authorization: `Bearer ${token}` },
    });
    const cart = JSON.parse(cartRes.body);
    expect(cart.items.length).toBe(0);
  });

  it('should list order history and allow cancelling order placed within 48h', async () => {
    // 1. Get history
    const historyRes = await app.inject({
      method: 'GET',
      url: '/api/orders',
      headers: { authorization: `Bearer ${token}` },
    });
    expect(historyRes.statusCode).toBe(200);
    const orders = JSON.parse(historyRes.body);
    expect(orders.length).toBeGreaterThan(0);

    const cancellableOrder = orders.find((o: any) => o.canCancel && o.status === 'PLACED');
    expect(cancellableOrder).toBeDefined();

    // 2. Cancel order
    const cancelRes = await app.inject({
      method: 'POST',
      url: `/api/orders/${cancellableOrder.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(cancelRes.statusCode).toBe(200);
    const cancelled = JSON.parse(cancelRes.body);
    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.payment.status).toBe('REFUNDED');
    expect(cancelled.cancelledAt).toBeDefined();
  });

  it('should support "Buy It Again" reordering past items into active cart', async () => {
    const historyRes = await app.inject({
      method: 'GET',
      url: '/api/orders',
      headers: { authorization: `Bearer ${token}` },
    });
    const orders = JSON.parse(historyRes.body);
    const orderToReorder = orders[0];

    const reorderRes = await app.inject({
      method: 'POST',
      url: `/api/orders/${orderToReorder.id}/reorder`,
      headers: { authorization: `Bearer ${token}` },
    });

    expect(reorderRes.statusCode).toBe(200);
    const cart = JSON.parse(reorderRes.body);
    expect(cart.items.length).toBeGreaterThan(0);
  });
});
