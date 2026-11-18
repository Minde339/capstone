import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CartService } from './cart.service';

const cartRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const cartService = new CartService();

  fastify.get('/api/cart', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Cart'],
      summary: 'Get current user cart',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const cart = await cartService.getCart(userId);
      return reply.send(cart);
    },
  });

  fastify.post('/api/cart/items', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Cart'],
      summary: 'Add item to cart',
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        required: ['bookId'],
        properties: {
          bookId: { type: 'string' },
          quantity: { type: 'integer', minimum: 1, default: 1 },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { bookId, quantity } = request.body as any;
      try {
        const cart = await cartService.addToCart(userId, bookId, quantity || 1);
        return reply.send(cart);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Could not add to cart' });
      }
    },
  });

  fastify.put('/api/cart/items/:itemId', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Cart'],
      summary: 'Update cart item quantity',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['itemId'],
        properties: {
          itemId: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { itemId } = request.params as any;
      const { quantity } = request.body as any;
      try {
        const cart = await cartService.updateQuantity(userId, itemId, quantity);
        return reply.send(cart);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Could not update cart' });
      }
    },
  });

  fastify.delete('/api/cart/items/:itemId', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Cart'],
      summary: 'Remove item from cart',
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        required: ['itemId'],
        properties: {
          itemId: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const { itemId } = request.params as any;
      try {
        const cart = await cartService.removeItem(userId, itemId);
        return reply.send(cart);
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Could not remove item' });
      }
    },
  });

  fastify.delete('/api/cart', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Cart'],
      summary: 'Clear cart',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      await cartService.clearCart(userId);
      return reply.send({ success: true, message: 'Cart cleared' });
    },
  });
};

export default cartRoutes;
