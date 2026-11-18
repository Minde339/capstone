import { getDatabase, IDatabase } from '../../db';

export interface BookFilterParams {
  search?: string;
  categoryId?: string;
  publisherId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest';
}

export class BooksService {
  private db: IDatabase;

  constructor(db?: IDatabase) {
    this.db = db || getDatabase();
  }

  async getCategories() {
    return await this.db.query('SELECT id, name, slug, description FROM categories ORDER BY name ASC');
  }

  async getPublishers() {
    return await this.db.query('SELECT id, name, slug, website FROM publishers ORDER BY name ASC');
  }

  private async getMetadataMaps() {
    const cats = await this.db.query('SELECT id, name FROM categories');
    const pubs = await this.db.query('SELECT id, name FROM publishers');
    const catMap = new Map<string, string>();
    const pubMap = new Map<string, string>();
    cats.forEach((c) => catMap.set(c.id, c.name));
    pubs.forEach((p) => pubMap.set(p.id, p.name));
    return { catMap, pubMap };
  }

  async getBooks(params: BookFilterParams = {}) {
    let sql = `
      SELECT b.id, b.title, b.author, b.isbn, b.description, b.price, b.stock_quantity as "stockQuantity",
             b.cover_image_url as "coverImageUrl", b.category_id as "categoryId",
             b.publisher_id as "publisherId", b.rating, b.review_count as "reviewCount",
             b.delivery_days as "deliveryDays", b.featured, b.format, b.tags, b.section, b.language,
             b.created_at as "createdAt"
      FROM books b
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.search) {
      const term = `%${params.search.toLowerCase()}%`;
      sql += ` AND (LOWER(b.title) LIKE $${paramIndex} OR LOWER(b.author) LIKE $${paramIndex + 1} OR LOWER(b.description) LIKE $${paramIndex + 2} OR LOWER(b.isbn) LIKE $${paramIndex + 3})`;
      queryParams.push(term, term, term, term);
      paramIndex += 4;
    }

    if (params.categoryId) {
      sql += ` AND b.category_id = $${paramIndex}`;
      queryParams.push(params.categoryId);
      paramIndex++;
    }

    if (params.publisherId) {
      sql += ` AND b.publisher_id = $${paramIndex}`;
      queryParams.push(params.publisherId);
      paramIndex++;
    }

    if (params.minPrice !== undefined && params.minPrice !== null && !isNaN(Number(params.minPrice))) {
      sql += ` AND b.price >= $${paramIndex}`;
      queryParams.push(Number(params.minPrice));
      paramIndex++;
    }

    if (params.maxPrice !== undefined && params.maxPrice !== null && !isNaN(Number(params.maxPrice))) {
      sql += ` AND b.price <= $${paramIndex}`;
      queryParams.push(Number(params.maxPrice));
      paramIndex++;
    }

    if (params.sort === 'price_asc') {
      sql += ' ORDER BY b.price ASC';
    } else if (params.sort === 'price_desc') {
      sql += ' ORDER BY b.price DESC';
    } else if (params.sort === 'rating_desc') {
      sql += ' ORDER BY b.rating DESC, b.review_count DESC';
    } else {
      sql += ' ORDER BY b.featured DESC, b.created_at DESC';
    }

    const [books, { catMap, pubMap }] = await Promise.all([
      this.db.query(sql, queryParams),
      this.getMetadataMaps(),
    ]);

    return books.map((b) => this.enrichBookWithDeliveryDate(b, catMap, pubMap));
  }

  async getBookById(id: string) {
    const [book, { catMap, pubMap }] = await Promise.all([
      this.db.queryOne(
        `SELECT b.id, b.title, b.author, b.isbn, b.description, b.price, b.stock_quantity as "stockQuantity",
                b.cover_image_url as "coverImageUrl", b.category_id as "categoryId",
                b.publisher_id as "publisherId", b.rating, b.review_count as "reviewCount",
                b.delivery_days as "deliveryDays", b.featured, b.format, b.tags, b.section, b.language,
                b.created_at as "createdAt"
         FROM books b
         WHERE b.id = $1`,
        [id]
      ),
      this.getMetadataMaps(),
    ]);

    if (!book) return null;

    const reviews = await this.db.query(
      `SELECT id, user_name as "userName", rating, comment, created_at as "createdAt"
       FROM reviews WHERE book_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return {
      ...this.enrichBookWithDeliveryDate(book, catMap, pubMap),
      reviews,
    };
  }

  async getRelatedBooks(bookId: string) {
    const book = await this.db.queryOne('SELECT category_id, publisher_id FROM books WHERE id = $1', [bookId]);
    if (!book) return [];

    const [related, { catMap, pubMap }] = await Promise.all([
      this.db.query(
        `SELECT b.id, b.title, b.author, b.isbn, b.description, b.price, b.stock_quantity as "stockQuantity",
                b.cover_image_url as "coverImageUrl", b.category_id as "categoryId",
                b.publisher_id as "publisherId", b.rating, b.review_count as "reviewCount",
                b.delivery_days as "deliveryDays", b.featured, b.format, b.tags, b.section, b.language,
                b.created_at as "createdAt"
         FROM books b
         WHERE b.id != $1 AND (b.category_id = $2 OR b.publisher_id = $3)
         LIMIT 4`,
        [bookId, book.category_id, book.publisher_id]
      ),
      this.getMetadataMaps(),
    ]);

    return related.map((b) => this.enrichBookWithDeliveryDate(b, catMap, pubMap));
  }

  async getRecommendations(userId?: string) {
    let categoryIds: string[] = [];

    if (userId) {
      // Find top categories user has previously purchased
      const userPurchases = await this.db.query(
        `SELECT DISTINCT b.category_id
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN books b ON oi.book_id = b.id
         WHERE o.user_id = $1 AND o.status != 'CANCELLED'
         LIMIT 3`,
        [userId]
      );
      categoryIds = userPurchases.map((p) => p.category_id).filter(Boolean);
    }

    const { catMap, pubMap } = await this.getMetadataMaps();

    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map((_, i) => `$${i + 1}`).join(',');
      const sql = `
        SELECT b.id, b.title, b.author, b.isbn, b.description, b.price, b.stock_quantity as "stockQuantity",
               b.cover_image_url as "coverImageUrl", b.category_id as "categoryId",
               b.publisher_id as "publisherId", b.rating, b.review_count as "reviewCount",
               b.delivery_days as "deliveryDays", b.featured, b.created_at as "createdAt"
        FROM books b
        WHERE b.category_id IN (${placeholders})
        ORDER BY b.rating DESC LIMIT 6
      `;
      const res = await this.db.query(sql, categoryIds);
      if (res.length > 0) {
        return res.map((b) => this.enrichBookWithDeliveryDate(b, catMap, pubMap));
      }
    }

    // Fallback: top rated & featured books
    const sql = `
      SELECT b.id, b.title, b.author, b.isbn, b.description, b.price, b.stock_quantity as "stockQuantity",
             b.cover_image_url as "coverImageUrl", b.category_id as "categoryId",
             b.publisher_id as "publisherId", b.rating, b.review_count as "reviewCount",
             b.delivery_days as "deliveryDays", b.featured, b.created_at as "createdAt"
      FROM books b
      ORDER BY b.rating DESC, b.featured DESC LIMIT 6
    `;
    const books = await this.db.query(sql);
    return books.map((b) => this.enrichBookWithDeliveryDate(b, catMap, pubMap));
  }

  private enrichBookWithDeliveryDate(book: any, catMap?: Map<string, string>, pubMap?: Map<string, string>) {
    const days = Number(book.deliveryDays) || 2;
    const arrivalDate = new Date(Date.now() + days * 86400000);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    const dateStr = arrivalDate.toLocaleDateString('en-US', options);

    const tagList = Array.isArray(book.tags)
      ? book.tags
      : typeof book.tags === 'string'
      ? book.tags.split(',').map((t: string) => t.trim())
      : ['Fiction'];

    return {
      ...book,
      categoryName: catMap?.get(book.categoryId) || book.categoryName || 'General',
      publisherName: pubMap?.get(book.publisherId) || book.publisherName || 'Independent',
      price: Number(book.price),
      rating: Number(book.rating),
      reviewCount: Number(book.reviewCount),
      stockQuantity: Number(book.stockQuantity),
      format: book.format || 'Paperback',
      tags: tagList,
      section: book.section || 'recommended',
      language: book.language || 'English',
      tentativeDeliveryDate: `Delivery by ${dateStr}`,
      tentativeDeliveryDateIso: arrivalDate.toISOString(),
    };
  }
}
