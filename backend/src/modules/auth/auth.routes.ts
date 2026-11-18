import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AuthService } from './auth.service';

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const authService = new AuthService();

  fastify.post('/api/auth/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Register a new customer',
      body: {
        type: 'object',
        required: ['email', 'password', 'fullName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          fullName: { type: 'string', minLength: 2 },
          phone: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, password, fullName, phone } = request.body as any;
      try {
        const user = await authService.register(email, password, fullName, phone);
        const token = fastify.jwt.sign({ id: user.id, email: user.email });
        return reply.status(201).send({ token, user });
      } catch (err: any) {
        return reply.status(400).send({ message: err.message || 'Registration failed' });
      }
    },
  });

  fastify.post('/api/auth/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Login customer',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body as any;
      try {
        const user = await authService.login(email, password);
        const token = fastify.jwt.sign({ id: user.id, email: user.email });
        return reply.send({ token, user });
      } catch (err: any) {
        return reply.status(401).send({ message: err.message || 'Authentication failed' });
      }
    },
  });

  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user profile',
      security: [{ BearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const userId = (request.user as any).id;
      const user = await authService.getUserById(userId);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      return reply.send(user);
    },
  });
};

export default authRoutes;
