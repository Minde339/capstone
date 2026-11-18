import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutQuote, Order } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getQuote(redeemGiftPoints = 0): Observable<CheckoutQuote> {
    return this.http.post<CheckoutQuote>(`${this.apiUrl}/checkout/quote`, { redeemGiftPoints });
  }

  createOrder(data: {
    addressId: string;
    paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'GIFT_POINTS_FULL';
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
    redeemGiftPoints?: number;
  }): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, data);
  }

  getOrderHistory(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${id}/cancel`, {});
  }

  reorderItems(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders/${id}/reorder`, {});
  }
}
