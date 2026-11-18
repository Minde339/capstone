import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import authPlugin from './plugins/auth';
import swaggerPlugin from './plugins/swagger';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import booksRoutes from './modules/books/books.routes';
import cartRoutes from './modules/cart/cart.routes';
import ordersRoutes from './modules/orders/orders.routes';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: process.env.NODE_ENV === 'test' ? false : true,
  });

  // Security & Middleware Plugins
  app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // Swagger Documentation
  app.register(swaggerPlugin);

  // Authentication Plugin
  app.register(authPlugin);

  // Health Check
  app.get('/health', async () => ({ status: 'UP', timestamp: new Date().toISOString() }));

  // Feature Modules
  app.register(authRoutes);
  app.register(userRoutes);
  app.register(booksRoutes);
  app.register(cartRoutes);
  app.register(ordersRoutes);

  return app;
}
