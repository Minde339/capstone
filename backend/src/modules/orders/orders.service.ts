import { getDatabase, IDatabase } from '../../db';
import { v4 as uuidv4 } from 'uuid';

export interface CreateOrderDto {
  addressId: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'GIFT_POINTS_FULL';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  redeemGiftPoints?: number;
}

export class OrdersService {
  private db: IDatabase;

  constructor(db?: IDatabase) {
    this.db = db || getDatabase();
  }

  async getQuote(userId: string, requestedPoints = 0) {
    const user = await this.db.queryOne('SELECT gift_points FROM users WHERE id = $1', [userId]);
    if (!user) throw new Error('User not found');

    const cart = await this.db.queryOne('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (!cart) {
      return {
        subtotal: 0,
        shippingFee: 0,
        giftPointsAvailable: user.gift_points,
        giftPointsRedeemed: 0,
        discountAmount: 0,
        totalAmount: 0,
      };
    }

    const items = await this.db.query(
      `SELECT ci.quantity, b.price FROM cart_items ci JOIN books b ON ci.book_id = b.id WHERE ci.cart_id = $1`,
      [cart.id]
    );

    const subtotal = Number(
      items.reduce((acc, it) => acc + Number(it.price) * Number(it.quantity), 0).toFixed(2)
    );

    if (subtotal === 0) {
      return {
        subtotal: 0,
        shippingFee: 0,
        giftPointsAvailable: user.gift_points,
        giftPointsRedeemed: 0,
        discountAmount: 0,
        totalAmount: 0,
      };
    }

    const shippingFee = subtotal >= 50 ? 0.0 : 4.99;
    const grossTotal = subtotal + shippingFee;

    // 1 point = $0.10 discount
    const maxPointsByUser = user.gift_points || 0;
    const maxPointsByCost = Math.floor(grossTotal / 0.1);
    const applicableMaxPoints = Math.min(maxPointsByUser, maxPointsByCost);

    const giftPointsRedeemed = Math.min(Math.max(0, requestedPoints), applicableMaxPoints);
    const discountAmount = Number((giftPointsRedeemed * 0.1).toFixed(2));
    const totalAmount = Number(Math.max(0, grossTotal - discountAmount).toFixed(2));

    return {
      subtotal,
      shippingFee,
      giftPointsAvailable: user.gift_points,
      giftPointsRedeemed,
      discountAmount,
      totalAmount,
    };
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const user = await this.db.queryOne('SELECT id, email, full_name, gift_points FROM users WHERE id = $1', [userId]);
    if (!user) throw new Error('User not found');

    const address = await this.db.queryOne('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [dto.addressId, userId]);
    if (!address) throw new Error('Selected delivery address not found');

    const cart = await this.db.queryOne('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (!cart) throw new Error('Cart is empty');

    const cartItems = await this.db.query(
      `SELECT ci.id, ci.book_id, ci.quantity, b.title, b.author, b.price, b.stock_quantity, b.cover_image_url, b.delivery_days
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      throw new Error('Cannot place an order with an empty cart');
    }

    // Verify stock
    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        throw new Error(`Insufficient stock for "${item.title}". Only ${item.stock_quantity} left.`);
      }
    }

    // Compute quote
    const quote = await this.getQuote(userId, dto.redeemGiftPoints || 0);

    // Validate payment method
    if (quote.totalAmount > 0 && dto.paymentMethod === 'GIFT_POINTS_FULL') {
      throw new Error('Gift points do not cover full order amount. Please use Credit or Debit card.');
    }

    const orderId = uuidv4();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `EBK-${new Date().getFullYear()}-${randomSuffix}`;

    const maxDeliveryDays = Math.max(...cartItems.map((it) => it.delivery_days || 3));
    const estimatedDeliveryDate = new Date(Date.now() + maxDeliveryDays * 86400000).toISOString();
    const createdAt = new Date().toISOString();

    const shippingAddressJson = JSON.stringify({
      recipientName: address.recipient_name,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
    });

    // Run transaction
    return await this.db.transaction(async (tx) => {
      // 1. Insert order
      await tx.execute(
        `INSERT INTO orders (id, order_number, user_id, address_id, shipping_address_json, subtotal, discount_amount, shipping_fee, total_amount, gift_points_redeemed, status, estimated_delivery_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          orderId,
          orderNumber,
          userId,
          address.id,
          shippingAddressJson,
          quote.subtotal,
          quote.discountAmount,
          quote.shippingFee,
          quote.totalAmount,
          quote.giftPointsRedeemed,
          'PLACED',
          estimatedDeliveryDate,
          createdAt,
        ]
      );

      // 2. Insert order items & deduct stock
      for (const item of cartItems) {
        const orderItemId = uuidv4();
        const unitPrice = Number(item.price);
        const totalPrice = Number((unitPrice * item.quantity).toFixed(2));

        await tx.execute(
          `INSERT INTO order_items (id, order_id, book_id, book_title, book_author, cover_image_url, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [orderItemId, orderId, item.book_id, item.title, item.author, item.cover_image_url, item.quantity, unitPrice, totalPrice]
        );

        await tx.execute('UPDATE books SET stock_quantity = stock_quantity - $1 WHERE id = $2', [
          item.quantity,
          item.book_id,
        ]);
      }

      // 3. Deduct redeemed points + award 5% points on subtotal (1 point per $1 spent)
      const earnedPoints = Math.floor(quote.subtotal);
      const newPoints = user.gift_points - quote.giftPointsRedeemed + earnedPoints;
      await tx.execute('UPDATE users SET gift_points = $1 WHERE id = $2', [newPoints, userId]);

      // 4. Create payment record
      const paymentId = uuidv4();
      const cardLast4 = dto.cardNumber ? dto.cardNumber.slice(-4) : '4242';
      const txnRef = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

      await tx.execute(
        `INSERT INTO payments (id, order_id, payment_method, amount_paid, status, transaction_ref, card_last4, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [paymentId, orderId, dto.paymentMethod, quote.totalAmount, 'SUCCESS', txnRef, cardLast4, createdAt]
      );

      // 5. Clear cart
      await tx.execute('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

      return await this.getOrderById(orderId, userId, tx);
    });
  }

  async getOrders(userId: string) {
    const orders = await this.db.query(
      `SELECT o.id, o.order_number as "orderNumber", o.subtotal, o.discount_amount as "discountAmount",
              o.shipping_fee as "shippingFee", o.total_amount as "totalAmount", o.gift_points_redeemed as "giftPointsRedeemed",
              o.status, o.shipping_address_json as "shippingAddressJson", o.estimated_delivery_date as "estimatedDeliveryDate",
              o.created_at as "createdAt", o.cancelled_at as "cancelledAt",
              p.payment_method as "paymentMethod", p.amount_paid as "amountPaid", p.status as "paymentStatus",
              p.transaction_ref as "transactionRef", p.card_last4 as "cardLast4"
       FROM orders o
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    const result = [];
    for (const order of orders) {
      const items = await this.db.query(
        `SELECT id, book_id as "bookId", book_title as "bookTitle", book_author as "bookAuthor",
                cover_image_url as "coverImageUrl", quantity, unit_price as "unitPrice", total_price as "totalPrice"
         FROM order_items WHERE order_id = $1`,
        [order.id]
      );

      const createdAt = new Date(order.createdAt).getTime();
      const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
      const canCancel = hoursSinceCreation <= 48 && (order.status === 'PLACED' || order.status === 'PROCESSING');

      let shippingAddress = null;
      try {
        shippingAddress = typeof order.shippingAddressJson === 'string' ? JSON.parse(order.shippingAddressJson) : order.shippingAddressJson;
      } catch {}

      result.push({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        giftPointsRedeemed: Number(order.giftPointsRedeemed),
        canCancel,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        createdAt: order.createdAt,
        cancelledAt: order.cancelledAt,
        shippingAddress,
        items: items.map((it) => ({
          ...it,
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice),
        })),
        payment: {
          paymentMethod: order.paymentMethod,
          amountPaid: Number(order.amountPaid),
          status: order.paymentStatus,
          transactionRef: order.transactionRef,
          cardLast4: order.cardLast4,
        },
      });
    }

    return result;
  }

  async getOrderById(orderId: string, userId: string, customDb?: IDatabase) {
    const db = customDb || this.db;
    const order = await db.queryOne(
      `SELECT o.id, o.order_number as "orderNumber", o.subtotal, o.discount_amount as "discountAmount",
              o.shipping_fee as "shippingFee", o.total_amount as "totalAmount", o.gift_points_redeemed as "giftPointsRedeemed",
              o.status, o.shipping_address_json as "shippingAddressJson", o.estimated_delivery_date as "estimatedDeliveryDate",
              o.created_at as "createdAt", o.cancelled_at as "cancelledAt",
              p.payment_method as "paymentMethod", p.amount_paid as "amountPaid", p.status as "paymentStatus",
              p.transaction_ref as "transactionRef", p.card_last4 as "cardLast4"
       FROM orders o
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (!order) return null;

    const items = await db.query(
      `SELECT id, book_id as "bookId", book_title as "bookTitle", book_author as "bookAuthor",
              cover_image_url as "coverImageUrl", quantity, unit_price as "unitPrice", total_price as "totalPrice"
       FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    const createdAt = new Date(order.createdAt).getTime();
    const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
    const canCancel = hoursSinceCreation <= 48 && (order.status === 'PLACED' || order.status === 'PROCESSING');

    let shippingAddress = null;
    try {
      shippingAddress = typeof order.shippingAddressJson === 'string' ? JSON.parse(order.shippingAddressJson) : order.shippingAddressJson;
    } catch {}

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount),
      giftPointsRedeemed: Number(order.giftPointsRedeemed),
      canCancel,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      cancelledAt: order.cancelledAt,
      shippingAddress,
      items: items.map((it) => ({
        ...it,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
      payment: {
        paymentMethod: order.paymentMethod,
        amountPaid: Number(order.amountPaid),
        status: order.paymentStatus,
        transactionRef: order.transactionRef,
        cardLast4: order.cardLast4,
      },
    };
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.db.queryOne('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
    if (!order) throw new Error('Order not found');

    if (order.status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    if (order.status !== 'PLACED' && order.status !== 'PROCESSING') {
      throw new Error(`Order cannot be cancelled in '${order.status}' status`);
    }

    const createdAt = new Date(order.created_at).getTime();
    const hoursSinceCreation = (Date.now() - createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 48) {
      throw new Error('Order cancellation window (48 hours) has expired');
    }

    const items = await this.db.query('SELECT book_id, quantity FROM order_items WHERE order_id = $1', [orderId]);

    return await this.db.transaction(async (tx) => {
      // 1. Update order status
      const now = new Date().toISOString();
      await tx.execute("UPDATE orders SET status = 'CANCELLED', cancelled_at = $1 WHERE id = $2", [now, orderId]);

      // 2. Update payment status to REFUNDED
      await tx.execute("UPDATE payments SET status = 'REFUNDED' WHERE order_id = $1", [orderId]);

      // 3. Restore stock
      for (const item of items) {
        if (item.book_id) {
          await tx.execute('UPDATE books SET stock_quantity = stock_quantity + $1 WHERE id = $2', [
            item.quantity,
            item.book_id,
          ]);
        }
      }

      // 4. Refund redeemed gift points
      if (order.gift_points_redeemed > 0) {
        await tx.execute('UPDATE users SET gift_points = gift_points + $1 WHERE id = $2', [
          order.gift_points_redeemed,
          userId,
        ]);
      }

      return await this.getOrderById(orderId, userId, tx);
    });
  }

  async reorderItems(orderId: string, userId: string) {
    const order = await this.db.queryOne('SELECT id FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
    if (!order) throw new Error('Order not found');

    const items = await this.db.query('SELECT book_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
    if (items.length === 0) throw new Error('No items to reorder');

    let cart = await this.db.queryOne('SELECT id FROM carts WHERE user_id = $1', [userId]);
    let cartId = cart?.id;
    if (!cartId) {
      cartId = uuidv4();
      await this.db.execute('INSERT INTO carts (id, user_id) VALUES ($1, $2)', [cartId, userId]);
    }

    for (const item of items) {
      if (!item.book_id) continue;
      const existing = await this.db.queryOne(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND book_id = $2',
        [cartId, item.book_id]
      );
      if (existing) {
        await this.db.execute('UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2', [
          item.quantity,
          existing.id,
        ]);
      } else {
        const itemId = uuidv4();
        await this.db.execute(
          'INSERT INTO cart_items (id, cart_id, book_id, quantity) VALUES ($1, $2, $3, $4)',
          [itemId, cartId, item.book_id, item.quantity]
        );
      }
    }

    // Return the updated cart
    const cartItems = await this.db.query(
      `SELECT ci.id, ci.book_id as "bookId", ci.quantity,
              b.title, b.author, b.cover_image_url as "coverImageUrl", b.price, b.stock_quantity as "stockQuantity"
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const formatted = cartItems.map((item) => ({
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

    return {
      id: cartId,
      items: formatted,
      subtotal: Number(formatted.reduce((acc, it) => acc + it.totalPrice, 0).toFixed(2)),
      itemCount: formatted.reduce((acc, it) => acc + it.quantity, 0),
    };
  }
}
