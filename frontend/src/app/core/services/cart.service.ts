import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Cart, CartItem } from '../models/models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = '/api';

  cart = signal<Cart>({ id: '', items: [], subtotal: 0, itemCount: 0 });
  itemCount = computed(() => this.cart().itemCount);
  subtotal = computed(() => this.cart().subtotal);

  constructor(private http: HttpClient, private authService: AuthService) {
    if (this.authService.isAuthenticated()) {
      this.loadCart();
    }
  }

  loadCart() {
    return this.http.get<Cart>(`${this.apiUrl}/cart`).pipe(
      tap((cart) => this.cart.set(cart))
    ).subscribe({
      error: () => {},
    });
  }

  addToCart(bookId: string, quantity = 1) {
    return this.http.post<Cart>(`${this.apiUrl}/cart/items`, { bookId, quantity }).pipe(
      tap((cart) => this.cart.set(cart))
    );
  }

  updateQuantity(itemId: string, quantity: number) {
    return this.http.put<Cart>(`${this.apiUrl}/cart/items/${itemId}`, { quantity }).pipe(
      tap((cart) => this.cart.set(cart))
    );
  }

  removeItem(itemId: string) {
    return this.http.delete<Cart>(`${this.apiUrl}/cart/items/${itemId}`).pipe(
      tap((cart) => this.cart.set(cart))
    );
  }

  clearCart() {
    return this.http.delete(`${this.apiUrl}/cart`).pipe(
      tap(() => this.cart.set({ id: '', items: [], subtotal: 0, itemCount: 0 }))
    );
  }
}
