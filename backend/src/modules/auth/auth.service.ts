import { getDatabase, IDatabase } from '../../db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  private db: IDatabase;

  constructor(db?: IDatabase) {
    this.db = db || getDatabase();
  }

  async register(email: string, password: string, fullName: string, phone?: string) {
    const existing = await this.db.queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const giftPoints = 100; // Welcome reward points

    await this.db.execute(
      'INSERT INTO users (id, email, password_hash, full_name, phone, gift_points) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, email.toLowerCase().trim(), passwordHash, fullName.trim(), phone || null, giftPoints]
    );

    return {
      id,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      phone: phone || null,
      giftPoints,
    };
  }

  async login(email: string, password: string) {
    const user = await this.db.queryOne(
      'SELECT id, email, password_hash, full_name, phone, gift_points FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      giftPoints: user.gift_points,
    };
  }

  async getUserById(id: string) {
    const user = await this.db.queryOne(
      'SELECT id, email, full_name, phone, gift_points FROM users WHERE id = $1',
      [id]
    );
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      giftPoints: user.gift_points,
    };
  }
}
