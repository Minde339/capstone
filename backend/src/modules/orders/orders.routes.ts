import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { OrdersService } from './orders.service';

const ordersRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const ordersService = new OrdersService();

  fastify.post('/api/checkout/quote', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Get checkout quote with gift points deduction',
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          redeemGiftPoints: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { redeemGiftPoints } = (request.body as any) || {};
      try {
        const quote = await ordersService.getQuote(userId, redeemGiftPoints || 0);
        return reply.send(quote);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Could not calculate quote' });
      }
    },
  });

  fastify.post('/api/orders', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Place order and process payment',
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        required: ['addressId', 'paymentMethod'],
        properties: {
          addressId: { type: 'string' },
          paymentMethod: { type: 'string', enum: ['CREDIT_CARD', 'DEBIT_CARD', 'GIFT_POINTS_FULL'] },
          cardNumber: { type: 'string' },
          cardExpiry: { type: 'string' },
          cardCvc: { type: 'string' },
          redeemGiftPoints: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      try {
        const order = await ordersService.createOrder(userId, request.body as any);
        return reply.status(201).send(order);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Order placement failed' });
      }
    },
  });

  fastify.get('/api/orders', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Get user order history',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const orders = await ordersService.getOrders(userId);
      return reply.send(orders);
    },
  });

  fastify.get('/api/orders/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Get single order details',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { id } = request.params as any;
      const order = await ordersService.getOrderById(id, userId);
      if (!order) {
        return reply.status(404).send({ message: 'Order not found' });
      }
      return reply.send(order);
    },
  });

  fastify.post('/api/orders/:id/cancel', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Cancel order within 48-hour window',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { id } = request.params as any;
      try {
        const cancelledOrder = await ordersService.cancelOrder(id, userId);
        return reply.send(cancelledOrder);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Cancellation failed' });
      }
    },
  });

  fastify.post('/api/orders/:id/reorder', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Checkout & Orders'],
      summary: 'Buy It Again: re-adds order items to cart',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { id } = request.params as any;
      try {
        const cart = await ordersService.reorderItems(id, userId);
        return reply.send(cart);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Reorder failed' });
      }
    },
  });
};

export default ordersRoutes;
