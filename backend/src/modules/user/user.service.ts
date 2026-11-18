import { getDatabase, IDatabase } from '../../db';
import { v4 as uuidv4 } from 'uuid';

export interface CreateAddressDto {
  recipientName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export class UserService {
  private db: IDatabase;

  constructor(db?: IDatabase) {
    this.db = db || getDatabase();
  }

  async getAddresses(userId: string) {
    const rows = await this.db.query(
      `SELECT id, recipient_name as "recipientName", street, city, state, postal_code as "postalCode", country, is_default as "isDefault"
       FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    return rows.map(r => ({
      ...r,
      isDefault: Boolean(r.isDefault)
    }));
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const id = uuidv4();
    if (dto.isDefault) {
      await this.db.execute('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    } else {
      // Check if user has no addresses yet, make this default
      const existing = await this.db.queryOne('SELECT COUNT(*) as count FROM addresses WHERE user_id = $1', [userId]);
      if (existing && Number(existing.count) === 0) {
        dto.isDefault = true;
      }
    }

    await this.db.execute(
      `INSERT INTO addresses (id, user_id, recipient_name, street, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        userId,
        dto.recipientName,
        dto.street,
        dto.city,
        dto.state || null,
        dto.postalCode,
        dto.country,
        Boolean(dto.isDefault),
      ]
    );

    return {
      id,
      recipientName: dto.recipientName,
      street: dto.street,
      city: dto.city,
      state: dto.state || null,
      postalCode: dto.postalCode,
      country: dto.country,
      isDefault: Boolean(dto.isDefault),
    };
  }

  async deleteAddress(userId: string, addressId: string) {
    await this.db.execute('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);
    return { success: true };
  }
}
