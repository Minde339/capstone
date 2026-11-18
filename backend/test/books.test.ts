import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Books & Catalogue API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  it('should list all categories', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/categories',
    });

    expect(res.statusCode).toBe(200);
    const categories = JSON.parse(res.body);
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c: any) => c.slug === 'technology-engineering')).toBe(true);
  });

  it('should list all publishers/brands', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/publishers',
    });

    expect(res.statusCode).toBe(200);
    const publishers = JSON.parse(res.body);
    expect(Array.isArray(publishers)).toBe(true);
    expect(publishers.some((p: any) => p.name.includes("O'Reilly"))).toBe(true);
  });

  it('should list books and support search keyword query', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books?search=focus',
    });

    expect(res.statusCode).toBe(200);
    const books = JSON.parse(res.body);
    expect(books.length).toBeGreaterThan(0);
    expect(books[0].title).toContain('Focus');
    expect(books[0].tentativeDeliveryDate).toBeDefined();
  });

  it('should filter books by category and price range', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books?categoryId=cat-selfhelp&minPrice=200&maxPrice=400',
    });

    expect(res.statusCode).toBe(200);
    const books = JSON.parse(res.body);
    expect(books.length).toBeGreaterThan(0);
    for (const book of books) {
      expect(book.categoryId).toBe('cat-selfhelp');
      expect(book.price).toBeGreaterThanOrEqual(200);
      expect(book.price).toBeLessThanOrEqual(400);
    }
  });

  it('should retrieve a single book with reviews and tentative delivery date', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books/book-1',
    });

    expect(res.statusCode).toBe(200);
    const book = JSON.parse(res.body);
    expect(book.id).toBe('book-1');
    expect(book.title).toBe('The Art of Focus');
    expect(book.tentativeDeliveryDate).toContain('Delivery by');
    expect(Array.isArray(book.reviews)).toBe(true);
    expect(book.reviews.length).toBeGreaterThan(0);
  });

  it('should return 404 for non-existent book ID', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books/non-existent-id-999',
    });

    expect(res.statusCode).toBe(404);
  });

  it('should fetch related books', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books/book-1/related',
    });

    expect(res.statusCode).toBe(200);
    const related = JSON.parse(res.body);
    expect(Array.isArray(related)).toBe(true);
    expect(related.every((b: any) => b.id !== 'book-1')).toBe(true);
  });

  it('should provide recommendations', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/books/recommendations',
    });

    expect(res.statusCode).toBe(200);
    const recs = JSON.parse(res.body);
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);
  });
});
