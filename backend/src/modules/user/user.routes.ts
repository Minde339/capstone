import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UserService } from './user.service';

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const userService = new UserService();

  fastify.get('/api/user/addresses', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['User & Addresses'],
      summary: 'Get saved delivery addresses',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const addresses = await userService.getAddresses(userId);
      return reply.send(addresses);
    },
  });

  fastify.post('/api/user/addresses', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['User & Addresses'],
      summary: 'Add a new delivery address',
      security: [{ BearerAuth: [] }],
      body: {
        type: 'object',
        required: ['recipientName', 'street', 'city', 'postalCode', 'country'],
        properties: {
          recipientName: { type: 'string' },
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          isDefault: { type: 'boolean' },
        },
      },
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const address = await userService.addAddress(userId, request.body as any);
      return reply.status(201).send(address);
    },
  });

  fastify.delete('/api/user/addresses/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['User & Addresses'],
      summary: 'Delete delivery address',
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
      await userService.deleteAddress(userId, id);
      return reply.send({ success: true, message: 'Address removed' });
    },
  });
};

export default userRoutes;
