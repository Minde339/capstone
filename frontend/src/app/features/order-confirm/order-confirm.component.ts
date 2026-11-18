import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/models';

@Component({
  selector: 'app-order-confirm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirm-backdrop">
      <div class="purchase-success-card">
        <!-- Success Icon -->
        <div class="success-badge">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 class="success-title">Your purchase of the following reads is successful</h1>

        <!-- Purchased Book Items Grid (Matching Payment&Purchase.png) -->
        <div class="purchased-books-grid" *ngIf="order && order.items && order.items.length > 0; else fallbackBooks">
          <article *ngFor="let item of order.items" class="purchase-book-card">
            <div class="book-cover">
              <img [src]="item.coverImageUrl || '/assets/covers/joy-of-minimalism.svg'" [alt]="item.bookTitle" />
            </div>
            <div class="book-details">
              <h3 class="book-title">{{ item.bookTitle }}</h3>
              <div class="book-author">by <span class="author-name">{{ item.bookAuthor }}</span></div>
              <p class="book-desc">Declutter your life to uncover peace, clarity, and joy.</p>
              <div class="book-format">Paperback</div>
              <div class="book-tags">
                <span class="tag-link">Non-fiction</span>, <span class="tag-link">Self Help</span>
              </div>
              <div class="book-price">₹{{ item.unitPrice }}</div>
              <div class="delivery-date">Delivery by <strong>{{ order.estimatedDeliveryDate | date: 'EEE, d MMM' }}</strong></div>
            </div>
          </article>
        </div>

        <!-- Fallback static preview matching slide if direct loaded -->
        <ng-template #fallbackBooks>
          <div class="purchased-books-grid">
            <article class="purchase-book-card">
              <div class="book-cover">
                <img src="/assets/covers/joy-of-minimalism.svg" alt="Joy of Minimalism" />
              </div>
              <div class="book-details">
                <h3 class="book-title">Joy of Minimalism</h3>
                <div class="book-author">by <span class="author-name">Daniel Reed</span></div>
                <p class="book-desc">Declutter your life to uncover peace, clarity, and joy.</p>
                <div class="book-format">Paperback</div>
                <div class="book-tags">
                  <span class="tag-link">Non-fiction</span>, <span class="tag-link">Self Help</span>
                </div>
                <div class="book-price">₹149</div>
                <div class="delivery-date">Delivery by <strong>Mon, 21 Jul</strong></div>
              </div>
            </article>

            <article class="purchase-book-card">
              <div class="book-cover">
                <img src="/assets/covers/path-to-success.svg" alt="The Path to Success" />
              </div>
              <div class="book-details">
                <h3 class="book-title">The Path to Success</h3>
                <div class="book-author">by <span class="author-name">James Wright</span></div>
                <p class="book-desc">A practical guide to achieving goals with clarity and confidence.</p>
                <div class="book-format">Paperback</div>
                <div class="book-tags">
                  <span class="tag-link">Non-fiction</span>, <span class="tag-link">Self Help</span>
                </div>
                <div class="book-price">₹359</div>
                <div class="delivery-date">Delivery by <strong>Mon, 21 Jul</strong></div>
              </div>
            </article>
          </div>
        </ng-template>

        <!-- Continue Shopping Action -->
        <div class="card-action">
          <a routerLink="/catalogue" class="btn-continue-shopping">
            <span>Continue your Shopping</span>
            <svg class="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 56px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .confirm-backdrop {
      min-height: calc(100vh - 56px);
      background-image: url('/assets/images/book-pattern-bg.svg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
    }

    .purchase-success-card {
      background-color: #262626;
      width: 100%;
      max-width: 820px;
      border-radius: 6px;
      padding: 2.5rem 2.5rem 2rem 2.5rem;
      box-shadow: 0 16px 48px rgba(0,0,0,0.7);
      border: 1px solid #393939;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .success-badge {
      width: 52px;
      height: 52px;
      background-color: #198038;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 12px rgba(25, 128, 56, 0.4);
    }

    .check-icon {
      width: 26px;
      height: 26px;
      color: #ffffff;
    }

    .success-title {
      font-size: 1.25rem;
      font-weight: 500;
      color: #ffffff;
      text-align: center;
      margin: 0 0 2rem 0;
      letter-spacing: -0.01em;
    }

    .purchased-books-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
      width: 100%;
      margin-bottom: 2.5rem;
    }

    @media (max-width: 768px) {
      .purchased-books-grid {
        grid-template-columns: 1fr;
      }
    }

    .purchase-book-card {
      display: flex;
      gap: 1.25rem;
      background-color: transparent;
    }

    .book-cover {
      width: 140px;
      min-width: 140px;
      height: 200px;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 6px 16px rgba(0,0,0,0.6);
    }

    .book-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .book-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .book-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 0.25rem 0;
    }

    .book-author {
      font-size: 0.85rem;
      color: #8d8d8d;
      margin-bottom: 0.4rem;
    }

    .author-name {
      color: #78a9ff;
    }

    .book-desc {
      font-size: 0.78rem;
      color: #c6c6c6;
      line-height: 1.35;
      margin: 0 0 0.35rem 0;
    }

    .book-format {
      font-size: 0.78rem;
      color: #8d8d8d;
      margin-bottom: 0.2rem;
    }

    .book-tags {
      font-size: 0.78rem;
      color: #78a9ff;
      margin-bottom: 0.65rem;
    }

    .book-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-top: auto;
      margin-bottom: 0.15rem;
    }

    .delivery-date {
      font-size: 0.75rem;
      color: #c6c6c6;
    }

    .card-action {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .btn-continue-shopping {
      background-color: #0f62fe;
      color: #ffffff;
      text-decoration: none;
      padding: 0.75rem 1.75rem;
      border-radius: 4px;
      font-size: 0.95rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      transition: background-color 0.15s;
    }

    .btn-continue-shopping:hover {
      background-color: #0043ce;
    }

    .book-icon {
      width: 18px;
      height: 18px;
    }
  `],
})
export class OrderConfirmComponent implements OnInit {
  orderService = inject(OrderService);
  route = inject(ActivatedRoute);

  order: Order | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(id).subscribe({
        next: (ord) => (this.order = ord),
        error: () => {},
      });
    }
  }
}
