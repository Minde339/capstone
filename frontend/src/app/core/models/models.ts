export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  giftPoints: number;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface Address {
  id: string;
  recipientName: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  website?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  stockQuantity: number;
  coverImageUrl: string;
  categoryId: string;
  categoryName?: string;
  publisherId: string;
  publisherName?: string;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  tentativeDeliveryDate: string;
  tentativeDeliveryDateIso?: string;
  featured?: boolean;
  format?: string;
  tags?: string[];
  section?: 'recommended' | 'bestsellers' | 'new_launches' | string;
  language?: string;
}

export interface BookDetail extends Book {
  reviews: Review[];
}

export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  price: number;
  quantity: number;
  stockQuantity: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CheckoutQuote {
  subtotal: number;
  shippingFee: number;
  giftPointsAvailable: number;
  giftPointsRedeemed: number;
  discountAmount: number;
  totalAmount: number;
}

export interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  paymentMethod: string;
  amountPaid: number;
  status: string;
  transactionRef: string;
  cardLast4?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  giftPointsRedeemed: number;
  canCancel: boolean;
  estimatedDeliveryDate: string;
  createdAt: string;
  cancelledAt?: string;
  shippingAddress: Address;
  items: OrderItem[];
  payment: OrderPayment;
}
