import { getDatabase, IDatabase } from '../../db';
import { v4 as uuidv4 } from 'uuid';

export class CartService {
  private db: IDatabase;

  constructor(db?: IDatabase) {
    this.db = db || getDatabase();
  }

  private async getOrCreateCartId(userId: string): Promise<string> {
    const existing = await this.db.queryOne('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (existing) {
      return existing.id;
    }
    const cartId = uuidv4();
    await this.db.execute('INSERT INTO carts (id, user_id) VALUES ($1, $2)', [cartId, userId]);
    return cartId;
  }

  async getCart(userId: string) {
    const cartId = await this.getOrCreateCartId(userId);

    const items = await this.db.query(
      `SELECT ci.id, ci.book_id as "bookId", ci.quantity,
              b.title, b.author, b.cover_image_url as "coverImageUrl", b.price, b.stock_quantity as "stockQuantity"
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at ASC`,
      [cartId]
    );

    const cartItems = items.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      coverImageUrl: item.coverImageUrl,
      price: Number(item.price),
      quantity: Number(item.quantity),
      stockQuantity: Number(item.stockQuantity),
      totalPrice: Number((Number(item.price) * Number(item.quantity)).toFixed(2)),
    }));

    const subtotal = Number(cartItems.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2));
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      id: cartId,
      items: cartItems,
      subtotal,
      itemCount,
    };
  }

  async addToCart(userId: string, bookId: string, quantity = 1) {
    if (quantity <= 0) throw new Error('Quantity must be greater than zero');

    const book = await this.db.queryOne('SELECT id, stock_quantity FROM books WHERE id = $1', [bookId]);
    if (!book) throw new Error('Book not found');

    const cartId = await this.getOrCreateCartId(userId);
    const existingItem = await this.db.queryOne(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND book_id = $2',
      [cartId, bookId]
    );

    const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (targetQuantity > book.stock_quantity) {
      throw new Error(`Only ${book.stock_quantity} units available in stock`);
    }

    if (existingItem) {
      await this.db.execute('UPDATE cart_items SET quantity = $1 WHERE id = $2', [targetQuantity, existingItem.id]);
    } else {
      const itemId = uuidv4();
      await this.db.execute(
        'INSERT INTO cart_items (id, cart_id, book_id, quantity) VALUES ($1, $2, $3, $4)',
        [itemId, cartId, bookId, quantity]
      );
    }

    return await this.getCart(userId);
  }

  async updateQuantity(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      return await this.removeItem(userId, itemId);
    }

    const cartId = await this.getOrCreateCartId(userId);
    const item = await this.db.queryOne(
      'SELECT ci.id, ci.book_id, b.stock_quantity FROM cart_items ci JOIN books b ON ci.book_id = b.id WHERE ci.id = $1 AND ci.cart_id = $2',
      [itemId, cartId]
    );

    if (!item) throw new Error('Cart item not found');
    if (quantity > item.stock_quantity) {
      throw new Error(`Only ${item.stock_quantity} units available in stock`);
    }

    await this.db.execute('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    return await this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cartId = await this.getOrCreateCartId(userId);
    await this.db.execute('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
    return await this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cartId = await this.getOrCreateCartId(userId);
    await this.db.execute('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    return { success: true };
  }
}
