import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container orders-wrapper">
      <div class="orders-header">
        <div>
          <h1>Your Order History</h1>
          <p class="orders-sub">Manage past purchases, re-order favorites, and track deliveries</p>
        </div>
        <a routerLink="/catalogue" class="btn btn-primary btn-sm">
          Browse More Books
        </a>
      </div>

      <!-- Orders List -->
      <div *ngIf="orders.length > 0; else noOrders" class="orders-list">
        <div *ngFor="let order of orders" class="order-card card">
          <!-- Card Header Bar -->
          <div class="order-card-header">
            <div class="header-left">
              <span class="order-num">{{ order.orderNumber }}</span>
              <span class="order-date">Placed on {{ order.createdAt | date: 'mediumDate' }}</span>
            </div>

            <div class="header-right">
              <span
                class="badge"
                [ngClass]="{
                  'badge-success': order.status === 'DELIVERED',
                  'badge-primary': order.status === 'PLACED' || order.status === 'PROCESSING',
                  'badge-warning': order.status === 'SHIPPED',
                  'badge-danger': order.status === 'CANCELLED'
                }"
              >
                ● {{ order.status }}
              </span>

              <span class="order-total">₹{{ order.totalAmount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Card Body: Items -->
          <div class="order-card-body">
            <div class="items-grid">
              <div *ngFor="let item of order.items" class="order-item-chip">
                <img [src]="item.coverImageUrl" [alt]="item.bookTitle" class="item-thumb" />
                <div class="item-text">
                  <h4 class="item-name" [routerLink]="['/books', item.bookId]">{{ item.bookTitle }}</h4>
                  <p class="item-author">by {{ item.bookAuthor }}</p>
                  <span class="item-meta">Qty: {{ item.quantity }} • ₹{{ item.unitPrice.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Tentative / Estimated Delivery Info -->
            <div class="delivery-status-box" *ngIf="order.status !== 'CANCELLED'">
              <span class="truck-icon">🚚</span>
              <div class="delivery-info-text">
                <strong *ngIf="order.status === 'DELIVERED'">Delivered on {{ order.estimatedDeliveryDate | date: 'mediumDate' }}</strong>
                <strong *ngIf="order.status !== 'DELIVERED'">Estimated Delivery: {{ order.estimatedDeliveryDate | date: 'fullDate' }}</strong>
                <p *ngIf="order.shippingAddress">Delivering to: {{ order.shippingAddress.recipientName }}, {{ order.shippingAddress.city }}</p>
              </div>
            </div>

            <div class="cancelled-status-box" *ngIf="order.status === 'CANCELLED'">
              <span class="cross-icon">✕</span>
              <div>
                <strong>Order Cancelled on {{ order.cancelledAt | date: 'medium' }}</strong>
                <p>Full refund processed. Any redeemed points have been credited back to your balance.</p>
              </div>
            </div>
          </div>

          <!-- Card Footer Actions: "Buy It Again" & "48-Hour Cancel" (Capstone Requirements) -->
          <div class="order-card-footer">
            <div class="footer-info">
              <span *ngIf="order.giftPointsRedeemed > 0" class="points-used">
                🎁 Redeemed {{ order.giftPointsRedeemed }} points (-₹{{ order.discountAmount.toFixed(2) }})
              </span>
            </div>

            <div class="footer-actions">
              <!-- Buy It Again Feature (Slide 4 Requirement) -->
              <button
                (click)="onBuyItAgain(order)"
                class="btn btn-secondary btn-sm buy-again-btn"
                title="Re-add items to cart"
              >
                🔄 Buy It Again
              </button>

              <!-- 48-Hour Order Cancellation (Slide 1 & 10 Requirement) -->
              <button
                *ngIf="order.canCancel"
                (click)="onCancelOrder(order)"
                class="btn btn-danger btn-sm"
              >
                ✕ Cancel Order (48h Window)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Orders State -->
      <ng-template #noOrders>
        <div class="no-orders card">
          <div class="no-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>When you place an order, you can track delivery and re-order books here.</p>
          <a routerLink="/catalogue" class="btn btn-primary mt-3">Start Shopping</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #161616;
      color: #f4f4f4;
      min-height: calc(100vh - 56px);
    }
    .orders-wrapper {
      max-width: 1400px;
      padding: 1.5rem 2rem 4rem;
    }
    .orders-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .orders-header h1 {
      font-size: 1.35rem;
      font-weight: 600;
      color: #ffffff;
    }
    .orders-sub {
      color: #8d8d8d;
      font-size: 0.9rem;
    }
    .orders-header .btn-primary {
      background-color: #0f62fe;
      color: #ffffff;
      border-radius: 0;
      border: none;
    }
    .orders-header .btn-primary:hover {
      background-color: #0043ce;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .order-card {
      background: #262626;
      border: 1px solid #393939;
      border-radius: 0;
      box-shadow: none;
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #393939;
      border-bottom: 1px solid #525252;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .order-num {
      font-weight: 700;
      color: #ffffff;
    }
    .order-date {
      font-size: 0.85rem;
      color: #c6c6c6;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .badge {
      border-radius: 0;
      background: #393939;
      color: #c6c6c6;
    }
    .badge-success { background: #1c2b21; color: #42be65; }
    .badge-primary { background: #001d6c; color: #78a9ff; }
    .badge-warning { background: #3a2f00; color: #f1c21b; }
    .badge-danger { background: #2d1a1c; color: #ff8389; }
    .order-total {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }
    .order-card-body {
      padding: 1.5rem;
    }
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .order-item-chip {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: #2c2c2c;
      border: 1px solid #393939;
    }
    .item-thumb {
      width: 50px;
      height: 70px;
      object-fit: cover;
    }
    .item-text {
      flex: 1;
      overflow: hidden;
    }
    .item-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    .item-name:hover {
      color: #78a9ff;
    }
    .item-author {
      font-size: 0.75rem;
      color: #8d8d8d;
    }
    .item-meta {
      font-size: 0.75rem;
      color: #c6c6c6;
      font-weight: 600;
    }
    .delivery-status-box {
      background: #1c2b21;
      border: 1px solid #24a148;
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #42be65;
      font-size: 0.875rem;
    }
    .delivery-status-box p {
      color: #c6c6c6;
    }
    .cancelled-status-box {
      background: #2d1a1c;
      border: 1px solid #da1e28;
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ff8389;
      font-size: 0.875rem;
    }
    .cancelled-status-box p {
      color: #c6c6c6;
    }
    .cross-icon {
      font-size: 1.3rem;
      font-weight: 800;
    }
    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid #393939;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .points-used {
      font-size: 0.825rem;
      color: #f1c21b;
      font-weight: 600;
    }
    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .footer-actions .btn {
      border-radius: 0;
      font-weight: 600;
    }
    .footer-actions .btn-secondary {
      background: transparent;
      border: 1px solid #78a9ff;
      color: #78a9ff;
    }
    .footer-actions .btn-secondary:hover {
      background: #393939;
    }
    .footer-actions .btn-danger {
      background: transparent;
      border: 1px solid #ff8389;
      color: #ff8389;
    }
    .footer-actions .btn-danger:hover {
      background: #393939;
    }
    .no-orders {
      text-align: center;
      padding: 4rem 2rem;
      max-width: 480px;
      margin: 2rem auto;
      background: #262626;
      border: 1px solid #393939;
      border-radius: 0;
      color: #c6c6c6;
    }
    .no-orders h2 {
      color: #ffffff;
    }
    .no-orders .btn-primary {
      background-color: #0f62fe;
      border-radius: 0;
    }
    .no-orders-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
  `],
})
export class OrderHistoryComponent implements OnInit {
  orderService = inject(OrderService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  orders: Order[] = [];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrderHistory().subscribe({
      next: (list) => (this.orders = list),
      error: () => this.toastService.error('Could not load order history'),
    });
  }

  onBuyItAgain(order: Order) {
    this.orderService.reorderItems(order.id).subscribe({
      next: (cart) => {
        this.cartService.cart.set(cart);
        this.toastService.success(`Added ${order.items.length} items from ${order.orderNumber} to your cart!`);
        this.router.navigate(['/checkout']);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Could not re-order items');
      },
    });
  }

  onCancelOrder(order: Order) {
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}? A full refund and points return will be processed immediately.`)) {
      return;
    }

    this.orderService.cancelOrder(order.id).subscribe({
      next: (cancelled) => {
        this.toastService.success(`Order ${cancelled.orderNumber} successfully cancelled.`);
        this.authService.refreshProfile().subscribe();
        this.loadOrders();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Order cancellation failed');
      },
    });
  }
}
