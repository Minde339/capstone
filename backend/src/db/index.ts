import { newDb, DataType } from 'pg-mem';
import { Pool } from 'pg';
import { config } from '../config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface IDatabase {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (db: IDatabase) => Promise<T>): Promise<T>;
}

class MemoryPgDb implements IDatabase {
  private pool: any;
  private db: any;

  constructor() {
    this.db = newDb({ autoCreateForeignKeyIndices: true });

    // Register extensions / custom functions
    this.db.registerExtension('uuid-ossp', (schema: any) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.text,
        implementation: () => uuidv4(),
      });
    });

    const pgAdapter = this.db.adapters.createPg();
    this.pool = new pgAdapter.Pool();
    this.initSchemaAndSeed();
  }

  private initSchemaAndSeed() {
    this.db.public.none(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50),
        gift_points INTEGER NOT NULL DEFAULT 100,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_name VARCHAR(150) NOT NULL,
        street VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS publishers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(150) UNIQUE NOT NULL,
        slug VARCHAR(170) UNIQUE NOT NULL,
        website VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(200) NOT NULL,
        isbn VARCHAR(20) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        cover_image_url TEXT,
        category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
        publisher_id VARCHAR(36) REFERENCES publishers(id) ON DELETE SET NULL,
        rating NUMERIC(3, 2) DEFAULT 0.00,
        review_count INTEGER DEFAULT 0,
        delivery_days INTEGER NOT NULL DEFAULT 3,
        featured BOOLEAN DEFAULT FALSE,
        format VARCHAR(50) DEFAULT 'Paperback',
        tags VARCHAR(255) DEFAULT 'Non-fiction, Self Help',
        section VARCHAR(50) DEFAULT 'recommended',
        language VARCHAR(50) DEFAULT 'English',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        book_id VARCHAR(36) NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(150) NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(36) PRIMARY KEY,
        cart_id VARCHAR(36) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
        book_id VARCHAR(36) NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(cart_id, book_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        address_id VARCHAR(36) REFERENCES addresses(id),
        shipping_address_json JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        total_amount NUMERIC(10, 2) NOT NULL,
        gift_points_redeemed INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
        estimated_delivery_date TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        cancelled_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        book_id VARCHAR(36) REFERENCES books(id),
        book_title VARCHAR(255) NOT NULL,
        book_author VARCHAR(200) NOT NULL,
        cover_image_url VARCHAR(500),
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10, 2) NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        payment_method VARCHAR(50) NOT NULL,
        amount_paid NUMERIC(10, 2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
        transaction_ref VARCHAR(100) NOT NULL,
        card_last4 VARCHAR(4),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    this.seedData();
  }

  private seedData() {
    const passwordHash = bcrypt.hashSync('Password123!', 10);

    // 1. Categories (Aligned with Capstone Catalogue)
    this.db.public.none(`
      INSERT INTO categories (id, name, slug, description) VALUES
      ('cat-romance', 'Romance', 'romance', 'Love, emotional journeys, and romantic drama'),
      ('cat-mystery', 'Mystery', 'mystery', 'Detective thrillers, suspense, and dark mysteries'),
      ('cat-scifi', 'Science Fiction', 'science-fiction', 'Futuristic worlds, space exploration, and AI adventures'),
      ('cat-fantasy', 'Fantasy', 'fantasy', 'Magic, myth, and epic world-building realms'),
      ('cat-historical', 'Historical', 'historical', 'Historical fiction and deep historical accounts'),
      ('cat-biography', 'Biography', 'biography', 'Memoirs and lives of extraordinary thinkers'),
      ('cat-selfhelp', 'Self-help', 'self-help', 'Mindset, productivity, focus, and personal growth'),
      ('cat-memoir', 'Memoir', 'memoir', 'Personal stories, autobiographies, and life lessons'),
      ('cat-travel', 'Travel', 'travel', 'Explorations, adventures, and global travel guides'),
      ('cat-cooking', 'Cooking', 'cooking', 'Culinary arts, gourmet recipes, and gastronomy'),
      ('cat-children', 'Children''s', 'childrens', 'Illustrated storybooks and tales for young readers'),
      ('cat-youngadult', 'Young Adult', 'young-adult', 'Coming-of-age fiction and teen adventures'),
      ('cat-comics', 'Comics & Graphic Novels', 'comics-graphic-novels', 'Visual storytelling, manga, and graphic novels'),
      ('cat-poetry', 'Poetry', 'poetry', 'Lyrical verses, anthologies, and modern poetry'),
      ('cat-drama', 'Drama', 'drama', 'Stage plays, dramatic screenplays, and tragedies'),
      ('cat-science', 'Science', 'science', 'Astrophysics, biology, and scientific discoveries'),
      ('cat-philosophy', 'Philosophy', 'philosophy', 'Classical ethics, existentialism, and logic'),
      ('cat-religion', 'Religion', 'religion', 'Spirituality, world theology, and religious traditions'),
      ('cat-languages', 'Language Learning', 'language-learning', 'Grammar guides, polyglot methods, and vocabulary'),
      ('cat-tech', 'Technology & Engineering', 'technology-engineering', 'Cloud, programming, architectures, and AI systems')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Publishers
    this.db.public.none(`
      INSERT INTO publishers (id, name, slug, website) VALUES
      ('pub-1', 'Penguin Random House', 'penguin-random-house', 'https://www.penguinrandomhouse.com'),
      ('pub-2', 'HarperCollins', 'harpercollins', 'https://www.harpercollins.com'),
      ('pub-3', 'Simon & Schuster', 'simon-schuster', 'https://www.simonandschuster.com'),
      ('pub-4', 'Macmillan Publishers', 'macmillan', 'https://www.macmillan.com'),
      ('pub-5', 'Hachette Book Group', 'hachette', 'https://www.hachettebookgroup.com'),
      ('pub-6', 'O''Reilly Media', 'oreilly-media', 'https://www.oreilly.com')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Demo Users
    this.db.public.none(`
      INSERT INTO users (id, email, password_hash, full_name, phone, gift_points) VALUES
      ('user-demo-1', 'john.doe@example.com', '${passwordHash}', 'John Doe', '+1-555-0199', 250),
      ('user-demo-2', 'alice.smith@example.com', '${passwordHash}', 'Alice Smith', '+1-555-0188', 100)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Addresses
    this.db.public.none(`
      INSERT INTO addresses (id, user_id, recipient_name, street, city, state, postal_code, country, is_default) VALUES
      ('addr-1', 'user-demo-1', 'John Doe', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 'United States', true),
      ('addr-2', 'user-demo-1', 'John Doe (Office)', '100 Innovation Way, Suite 400', 'San Francisco', 'CA', '94105', 'United States', false)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Books (Aligned with Capstone 9 Book Deck)
    this.db.public.none(`
      INSERT INTO books (id, title, author, isbn, description, price, stock_quantity, cover_image_url, category_id, publisher_id, rating, review_count, delivery_days, featured, format, tags, section, language) VALUES
      ('book-1', 'The Art of Focus', 'Arjun Patel', '978-0143127741', 'Practical guide to mastering focus & boosting productivity every day.', 399.00, 50, '/assets/covers/art-of-focus.svg', 'cat-selfhelp', 'pub-1', 4.90, 140, 2, true, 'Paperback', 'Non-fiction, Self Help', 'recommended', 'English'),
      ('book-2', 'The Art of Learning', 'Raj Patel', '978-0743277457', 'Master the mindset and methods for effective lifelong learning.', 259.00, 45, '/assets/covers/art-of-learning.svg', 'cat-selfhelp', 'pub-2', 4.85, 95, 2, true, 'Paperback', 'Non-fiction, Self Help', 'recommended', 'English'),
      ('book-3', 'The Path to Success', 'James Wright', '978-1501111105', 'A practical guide to achieving goals with clarity and confidence.', 359.00, 30, '/assets/covers/path-to-success.svg', 'cat-selfhelp', 'pub-3', 4.75, 80, 2, true, 'Paperback', 'Non-fiction, Self Help', 'recommended', 'English'),
      ('book-4', 'The Midnight Hour', 'James Adams', '978-0062870674', 'Haunting tale of a man''s journey & the shadows of a forgotten past.', 299.00, 60, '/assets/covers/midnight-hour.svg', 'cat-mystery', 'pub-4', 4.88, 210, 2, true, 'Paperback', 'Fiction, Thriller, Horror', 'bestsellers', 'English'),
      ('book-5', 'Beneath the Stars', 'Jessica Martin', '978-1984822185', 'A heartwarming tale, where two souls discover who you need.', 499.00, 40, '/assets/covers/beneath-the-stars.svg', 'cat-romance', 'pub-1', 4.95, 320, 2, true, 'Hard Cover', 'Fiction, Love, Drama', 'bestsellers', 'English'),
      ('book-6', 'The Final Frontier', 'Laura Mitchell', '978-0593135204', 'A mission to space secrets to change humanity forever.', 359.00, 35, '/assets/covers/final-frontier.svg', 'cat-scifi', 'pub-2', 4.91, 180, 2, true, 'Paperback', 'Fiction, Thriller', 'bestsellers', 'English'),
      ('book-7', 'Joy of Minimalism', 'Daniel Reed', '978-0525559474', 'Declutter your life to uncover peace, clarity, and joy.', 149.00, 55, '/assets/covers/joy-of-minimalism.svg', 'cat-selfhelp', 'pub-5', 4.70, 65, 2, true, 'Paperback', 'Non-fiction, Self Help', 'new_launches', 'English'),
      ('book-8', 'The Vanishing House', 'Clara Nelson', '978-0393609394', 'A chilling mystery unfolds within a house that disappears.', 99.00, 75, '/assets/covers/vanishing-house.svg', 'cat-mystery', 'pub-4', 4.65, 45, 2, true, 'eBook', 'Fiction, Horror', 'new_launches', 'English'),
      ('book-9', 'The Lost Kitten', 'Emilly Parker', '978-0553380163', 'A heartwarming tale of courage, friendship, and feline adventure.', 339.00, 50, '/assets/covers/lost-kitten.svg', 'cat-children', 'pub-3', 4.92, 110, 2, true, 'Hardcover', 'Fiction, Children', 'new_launches', 'English'),
      ('book-10', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'The definitive guide to the principles and architectures of scalable, reliable, and maintainable data systems.', 449.00, 35, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'cat-tech', 'pub-6', 4.95, 128, 2, false, 'Paperback', 'Technology, Cloud', 'recommended', 'English'),
      ('book-11', 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Learn the disciplines, principles, and practices of writing readable, maintainable, and clean code.', 399.00, 50, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', 'cat-tech', 'pub-6', 4.75, 210, 2, false, 'Paperback', 'Technology, Software', 'recommended', 'English')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. Reviews
    this.db.public.none(`
      INSERT INTO reviews (id, book_id, user_id, user_name, rating, comment, created_at) VALUES
      ('rev-1', 'book-1', 'user-demo-1', 'John Doe', 5, 'Every software architect must read this. Unmatched depth on distributed consistency and partitioning.', NOW() - INTERVAL '10 days'),
      ('rev-2', 'book-1', 'user-demo-2', 'Alice Smith', 5, 'Helped me pass my system design interviews and design our company streaming platform.', NOW() - INTERVAL '5 days'),
      ('rev-3', 'book-6', 'user-demo-1', 'John Doe', 5, 'Incredible hard sci-fi that keeps you on the edge of your seat from page one!', NOW() - INTERVAL '3 days')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. Orders & Payments
    this.db.public.none(`
      INSERT INTO orders (id, order_number, user_id, address_id, shipping_address_json, subtotal, discount_amount, shipping_fee, total_amount, gift_points_redeemed, status, estimated_delivery_date, created_at) VALUES
      ('ord-demo-1', 'EBK-2026-1001', 'user-demo-1', 'addr-1', '{"recipientName": "John Doe", "street": "742 Evergreen Terrace", "city": "Springfield", "state": "OR", "postalCode": "97477", "country": "United States"}', 63.98, 10.00, 0.00, 53.98, 100, 'DELIVERED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '20 days'),
      ('ord-demo-2', 'EBK-2026-1002', 'user-demo-1', 'addr-1', '{"recipientName": "John Doe", "street": "742 Evergreen Terrace", "city": "Springfield", "state": "OR", "postalCode": "97477", "country": "United States"}', 44.99, 0.00, 4.99, 49.98, 0, 'PLACED', NOW() + INTERVAL '3 days', NOW() - INTERVAL '4 hours')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO order_items (id, order_id, book_id, book_title, book_author, cover_image_url, quantity, unit_price, total_price) VALUES
      ('oi-1', 'ord-demo-1', 'book-1', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 1, 44.99, 44.99),
      ('oi-2', 'ord-demo-1', 'book-5', 'Klara and the Sun', 'Kazuo Ishiguro', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80', 1, 18.99, 18.99),
      ('oi-3', 'ord-demo-2', 'book-1', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 1, 44.99, 44.99)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO payments (id, order_id, payment_method, amount_paid, status, transaction_ref, card_last4, created_at) VALUES
      ('pay-1', 'ord-demo-1', 'CREDIT_CARD', 53.98, 'SUCCESS', 'TXN-98127391-A', '4242', NOW() - INTERVAL '20 days'),
      ('pay-2', 'ord-demo-2', 'CREDIT_CARD', 49.98, 'SUCCESS', 'TXN-98127392-B', '1234', NOW() - INTERVAL '4 hours')
      ON CONFLICT (id) DO NOTHING;
    `);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const res = await this.pool.query(sql, params);
    return res.rows[0] || null;
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  async transaction<T>(callback: (db: IDatabase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txDb: IDatabase = {
        query: async (sql, params = []) => (await client.query(sql, params)).rows,
        queryOne: async (sql, params = []) => (await client.query(sql, params)).rows[0] || null,
        execute: async (sql, params = []) => { await client.query(sql, params); },
        transaction: async (cb) => cb(txDb),
      };
      const result = await callback(txDb);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

class PostgresDb implements IDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const res = await this.pool.query(sql, params);
    return res.rows[0] || null;
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  async transaction<T>(callback: (db: IDatabase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const txDb: IDatabase = {
        query: async (sql, params = []) => (await client.query(sql, params)).rows,
        queryOne: async (sql, params = []) => (await client.query(sql, params)).rows[0] || null,
        execute: async (sql, params = []) => { await client.query(sql, params); },
        transaction: async (cb) => cb(txDb),
      };
      const result = await callback(txDb);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    if (config.databaseUrl && config.databaseUrl.startsWith('postgres')) {
      dbInstance = new PostgresDb(config.databaseUrl);
    } else {
      // Pure JS In-Memory PostgreSQL emulator (Zero native compilation dependencies!)
      dbInstance = new MemoryPgDb();
    }
  }
  return dbInstance;
}

export function createMemoryDatabase(): IDatabase {
  return new MemoryPgDb();
}
