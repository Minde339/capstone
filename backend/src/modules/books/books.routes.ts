import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { BooksService } from './books.service';

const booksRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const booksService = new BooksService();

  fastify.get('/api/categories', {
    schema: {
      tags: ['Catalogue'],
      summary: 'List all book categories',
    },
    handler: async (_request, reply) => {
      const categories = await booksService.getCategories();
      return reply.send(categories);
    },
  });

  fastify.get('/api/publishers', {
    schema: {
      tags: ['Catalogue'],
      summary: 'List all publishers and brands',
    },
    handler: async (_request, reply) => {
      const publishers = await booksService.getPublishers();
      return reply.send(publishers);
    },
  });

  fastify.get('/api/books', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Search and filter books',
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          categoryId: { type: 'string' },
          publisherId: { type: 'string' },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          sort: { type: 'string', enum: ['price_asc', 'price_desc', 'rating_desc', 'newest'] },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const query = request.query as any;
        const books = await booksService.getBooks(query);
        return reply.send(books);
      } catch (err: any) {
        fastify.log.error(err);
        return reply.status(500).send({ message: err.message, stack: err.stack });
      }
    },
  });

  fastify.get('/api/books/recommendations', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get recommended books',
    },
    handler: async (request, reply) => {
      let userId: string | undefined;
      try {
        await request.jwtVerify();
        userId = (request.user as any)?.id;
      } catch {
        // Guest user fallback
      }
      const recommendations = await booksService.getRecommendations(userId);
      return reply.send(recommendations);
    },
  });

  fastify.get('/api/books/:id', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get book details by ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const book = await booksService.getBookById(id);
      if (!book) {
        return reply.status(404).send({ message: 'Book not found' });
      }
      return reply.send(book);
    },
  });

  fastify.get('/api/books/:id/related', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get related books for a book',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const related = await booksService.getRelatedBooks(id);
      return reply.send(related);
    },
  });
};

export default booksRoutes;
