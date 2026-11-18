import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CheckoutQuote, Address } from '../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <a routerLink="/">Home</a>
        <span class="separator">/</span>
        <span>Non-Fiction</span>
        <span class="separator">/</span>
        <span>Self Help</span>
        <span class="separator">/</span>
        <span>Joy of Minimalism</span>
        <span class="separator">/</span>
        <span class="current">Checkout /</span>
      </nav>

      <h1 class="page-title">Shopping Cart</h1>

      <!-- Top Book Cards Row in Shopping Cart -->
      <section class="cart-items-row" *ngIf="cartService.cart().items.length > 0; else emptyCartTpl">
        <div class="cart-book-card" *ngFor="let item of cartService.cart().items">
          <div class="card-cover">
            <img [src]="item.coverImageUrl || '/assets/covers/joy-of-minimalism.svg'" [alt]="item.title" />
          </div>
          <div class="card-details">
            <h3 class="book-title">{{ item.title }}</h3>
            <div class="book-author">by <span class="author-link">{{ item.author }}</span></div>
            <p class="book-desc">Declutter your life to uncover peace, clarity, and joy.</p>
            <div class="book-format">Paperback</div>
            <div class="book-tags">
              <span class="tag-link">Non-fiction</span>, <span class="tag-link">Self Help</span>
            </div>
            <div class="book-price">₹{{ item.price }}</div>
            <div class="delivery-date">Delivery by Mon, 21 Jul</div>

            <!-- Quantity Counter -->
            <div class="quantity-counter">
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="updateQuantity(item.id, item.quantity - 1)">−</button>
              <button class="qty-btn" (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
          </div>
        </div>
      </section>

      <ng-template #emptyCartTpl>
        <div class="empty-cart-card">
          <p>Your shopping cart is currently empty.</p>
          <a routerLink="/catalogue" class="btn-primary">Browse Bookstore</a>
        </div>
      </ng-template>

      <!-- Bottom Split Section: Address & Grand Total -->
      <div class="bottom-split-grid" *ngIf="cartService.cart().items.length > 0">
        <!-- Left: Address Form -->
        <section class="address-section card-box">
          <h2 class="section-title">Address</h2>

          <div class="saved-address-toggle">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="useSavedAddress" (change)="toggleSavedAddress()" />
              <span>Use Saved Address</span>
            </label>
          </div>

          <div class="form-grid">
            <div class="form-row two-cols">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" [(ngModel)]="firstName" placeholder="First Name" class="form-control" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" [(ngModel)]="lastName" placeholder="Last Name" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Address</label>
              <input type="text" [(ngModel)]="street" placeholder="Address Line 2" class="form-control" />
            </div>

            <div class="form-row three-cols">
              <div class="form-group">
                <label>e-mail</label>
                <input type="email" [(ngModel)]="email" placeholder="e-mail" class="form-control" />
              </div>
              <div class="form-group">
                <label>City</label>
                <input type="text" [(ngModel)]="city" placeholder="City" class="form-control" />
              </div>
              <div class="form-group">
                <label>Pin</label>
                <input type="text" [(ngModel)]="postalCode" placeholder="000000" class="form-control" />
              </div>
            </div>

            <div class="form-row three-cols">
              <div class="form-group">
                <label>Phone Number</label>
                <div class="phone-input-group">
                  <select class="phone-code-select">
                    <option>+91</option>
                    <option>+1</option>
                    <option>+44</option>
                  </select>
                  <input type="text" [(ngModel)]="phone" placeholder="12345567890" class="form-control phone-number-input" />
                </div>
              </div>
              <div class="form-group">
                <label>State</label>
                <input type="text" [(ngModel)]="state" placeholder="State" class="form-control" />
              </div>
              <div class="form-group">
                <label>Country</label>
                <select [(ngModel)]="country" class="form-control">
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Right: Grand Total Card -->
        <section class="grand-total-section card-box">
          <div class="total-illustration">
            <img src="/assets/images/book-pattern-bg.svg" alt="Illustration" class="promo-bg" />
          </div>

          <div class="total-details">
            <h2 class="section-title">Grand Total</h2>

            <div class="summary-line">
              <span>Price ({{ cartService.itemCount() }} items)</span>
              <span>₹{{ cartService.subtotal().toFixed(2) }}</span>
            </div>

            <div class="summary-line">
              <span>Tax</span>
              <span>₹{{ calculatedTax.toFixed(2) }}</span>
            </div>

            <div class="summary-line">
              <span>Delivery Charges</span>
              <span class="free-text">Free</span>
            </div>

            <!-- Apply Coupon / Gift Points -->
            <div class="coupon-row">
              <input type="text" [(ngModel)]="couponCode" placeholder="Apply Coupon" class="coupon-input" />
              <button class="btn-apply" (click)="applyCoupon()">Apply</button>
            </div>

            <div class="summary-line discount-line" *ngIf="discountAmount > 0">
              <span>Discount</span>
              <span class="discount-val">₹{{ discountAmount }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-line total-line">
              <span class="total-label">Total Amount</span>
              <span class="total-value">₹{{ finalTotalAmount }}</span>
            </div>

            <button class="btn-pay-now" (click)="openPaymentModal()">
              <span>Pay Now</span>
              <svg class="cash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M6 12h.01M18 12h.01"></path>
              </svg>
            </button>
          </div>
        </section>
      </div>

      <!-- Payment Screen Modal (Matching PaymentScreen.png) -->
      <div class="payment-modal-backdrop" *ngIf="showPaymentModal" (click)="showPaymentModal = false">
        <div class="payment-dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2 class="dialog-title">Complete Payment</h2>
            <div class="dialog-payable">Payable Amount: ₹{{ finalTotalAmount }}</div>
          </div>

          <div class="dialog-body">
            <!-- Left Payment Tabs -->
            <div class="payment-tabs">
              <button
                class="tab-btn"
                [class.active]="selectedTab === 'credit'"
                (click)="selectedTab = 'credit'"
              >
                Credit Card
              </button>
              <button
                class="tab-btn"
                [class.active]="selectedTab === 'debit'"
                (click)="selectedTab = 'debit'"
              >
                Debit card
              </button>
              <button
                class="tab-btn"
                [class.active]="selectedTab === 'upi'"
                (click)="selectedTab = 'upi'"
              >
                UPI
              </button>
              <button
                class="tab-btn"
                [class.active]="selectedTab === 'wallet'"
                (click)="selectedTab = 'wallet'"
              >
                Wallet
              </button>
            </div>

            <!-- Right Tab Form Content -->
            <div class="tab-content">
              <!-- Credit / Debit Card Form -->
              <div class="card-form" *ngIf="selectedTab === 'credit' || selectedTab === 'debit'">
                <div class="form-row two-cols">
                  <div class="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      [(ngModel)]="cardNumber"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      class="form-control dark-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      [(ngModel)]="cardName"
                      placeholder="Name"
                      class="form-control dark-input"
                    />
                  </div>
                </div>

                <div class="form-row two-cols">
                  <div class="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      [(ngModel)]="cvv"
                      placeholder="XXX"
                      maxlength="4"
                      class="form-control dark-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Date of Expiry</label>
                    <input
                      type="text"
                      [(ngModel)]="expiry"
                      placeholder="MM/YYYY"
                      class="form-control dark-input"
                    />
                  </div>
                </div>
              </div>

              <!-- UPI Form -->
              <div class="upi-form" *ngIf="selectedTab === 'upi'">
                <div class="form-group">
                  <label>UPI VPA ID</label>
                  <input
                    type="text"
                    [(ngModel)]="upiId"
                    placeholder="username@okhdfcbank"
                    class="form-control dark-input"
                  />
                </div>
              </div>

              <!-- Wallet Form -->
              <div class="wallet-form" *ngIf="selectedTab === 'wallet'">
                <div class="form-group">
                  <label>Select Digital Wallet</label>
                  <select class="form-control dark-input">
                    <option>PayTM Wallet (Balance: ₹1,500)</option>
                    <option>PhonePe Wallet</option>
                    <option>Amazon Pay</option>
                  </select>
                </div>
              </div>

              <!-- Submit Payment -->
              <div class="dialog-actions">
                <button class="btn-pay-now-modal" [disabled]="submitting" (click)="processPayment()">
                  <span>{{ submitting ? 'Processing...' : 'Pay Now' }}</span>
                  <svg class="cash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #161616;
      color: #f4f4f4;
      min-height: calc(100vh - 56px);
      padding: 1.5rem 2rem 4rem 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .checkout-page-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #78a9ff;
      margin-bottom: 1rem;
    }

    .breadcrumb-nav a {
      color: #78a9ff;
      text-decoration: none;
    }

    .separator {
      color: #525252;
    }

    .breadcrumb-nav .current {
      color: #8d8d8d;
    }

    .page-title {
      font-size: 1.35rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 1.5rem;
    }

    /* Top Cart Items Row */
    .cart-items-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .cart-book-card {
      display: flex;
      gap: 1.25rem;
      background-color: #212121;
      padding: 1.25rem;
      border-radius: 4px;
    }

    .card-cover {
      width: 135px;
      min-width: 135px;
      height: 190px;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .card-details {
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
      margin-bottom: 0.35rem;
    }

    .author-link {
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
      margin-bottom: 0.5rem;
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
      margin-bottom: 0.65rem;
    }

    .quantity-counter {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .qty-val {
      font-size: 0.9rem;
      font-weight: 600;
      color: #ffffff;
    }

    .qty-btn {
      background: none;
      border: 1px solid #525252;
      color: #ffffff;
      width: 24px;
      height: 24px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .qty-btn:hover {
      background-color: #393939;
    }

    /* Bottom Grid */
    .bottom-split-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;
    }

    .card-box {
      background-color: #212121;
      border-radius: 4px;
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 1.25rem 0;
    }

    .saved-address-toggle {
      margin-bottom: 1.25rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #c6c6c6;
      cursor: pointer;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      gap: 1rem;
    }

    .form-row.two-cols {
      grid-template-columns: 1fr 1fr;
    }

    .form-row.three-cols {
      grid-template-columns: 1.2fr 1fr 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.75rem;
      color: #8d8d8d;
    }

    .form-control {
      background-color: #2c2c2c;
      border: 1px solid #393939;
      border-radius: 3px;
      color: #ffffff;
      height: 38px;
      padding: 0 0.75rem;
      font-size: 0.85rem;
      outline: none;
    }

    .form-control:focus {
      border-color: #0f62fe;
    }

    .phone-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .phone-code-select {
      background-color: #2c2c2c;
      border: 1px solid #393939;
      border-radius: 3px;
      color: #ffffff;
      width: 70px;
      padding: 0 0.5rem;
      font-size: 0.85rem;
    }

    .phone-number-input {
      flex: 1;
    }

    /* Grand Total */
    .grand-total-section {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 1.25rem;
      padding: 1.5rem;
    }

    .total-illustration {
      border-radius: 4px;
      overflow: hidden;
      height: 100%;
    }

    .promo-bg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .total-details {
      display: flex;
      flex-direction: column;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #c6c6c6;
      margin-bottom: 0.65rem;
    }

    .free-text {
      color: #ffffff;
    }

    .coupon-row {
      display: flex;
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .coupon-input {
      flex: 1;
      background: none;
      border: none;
      border-bottom: 1px solid #525252;
      color: #ffffff;
      font-size: 0.85rem;
      padding: 0.35rem 0;
      outline: none;
    }

    .btn-apply {
      background-color: #0f62fe;
      color: #ffffff;
      border: none;
      border-radius: 3px;
      padding: 0.35rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .discount-line {
      color: #42be65;
    }

    .discount-val {
      color: #ffffff;
    }

    .summary-divider {
      height: 1px;
      background-color: #393939;
      margin: 0.75rem 0;
    }

    .total-line {
      margin-top: 0.25rem;
      margin-bottom: 1.5rem;
    }

    .total-label {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
    }

    .total-value {
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
    }

    .btn-pay-now {
      background-color: #0f62fe;
      color: #ffffff;
      border: none;
      border-radius: 3px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: auto;
    }

    .btn-pay-now:hover {
      background-color: #0043ce;
    }

    .cash-icon {
      width: 18px;
      height: 18px;
    }

    /* Modal Backdrop matching PaymentScreen.png */
    .payment-modal-backdrop {
      position: fixed;
      top: 56px;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url('/assets/images/book-pattern-bg.svg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1.5rem;
    }

    .payment-dialog {
      background-color: #262626;
      width: 100%;
      max-width: 650px;
      border-radius: 0;
      box-shadow: 0 16px 36px rgba(0,0,0,0.7);
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #0f62fe;
    }

    .dialog-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .dialog-payable {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }

    .dialog-body {
      display: grid;
      grid-template-columns: 170px 1fr;
      min-height: 260px;
    }

    .payment-tabs {
      background-color: #393939;
      display: flex;
      flex-direction: column;
    }

    .tab-btn {
      background-color: #393939;
      border: none;
      border-bottom: 1px solid #525252;
      border-left: 3px solid transparent;
      padding: 1.4rem 1.25rem;
      text-align: left;
      color: #c6c6c6;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }

    .tab-btn:hover {
      background-color: #4c4c4c;
      color: #ffffff;
    }

    .tab-btn.active {
      background-color: #262626;
      color: #ffffff;
      font-weight: 600;
      border-left-color: #0f62fe;
    }

    .tab-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .dark-input {
      background-color: #393939;
      border: none;
      border-bottom: 1px solid #8d8d8d;
      border-radius: 0;
      height: 44px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-pay-now-modal {
      background-color: #0f62fe;
      color: #ffffff;
      border: none;
      border-radius: 3px;
      padding: 0.6rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .btn-pay-now-modal:hover {
      background-color: #0043ce;
    }
  `],
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  // Address Form State
  useSavedAddress = true;
  firstName = 'John';
  lastName = 'Doe';
  street = '742 Evergreen Terrace, Apt 4B';
  email = 'john.doe@example.com';
  city = 'Springfield';
  postalCode = '97477';
  phone = '9876543210';
  state = 'Oregon';
  country = 'India';

  // Summary State
  calculatedTax = 62.0;
  discountAmount = 100.0;
  couponCode = 'GIFT100';

  // Payment Modal State
  showPaymentModal = false;
  selectedTab = 'credit';
  cardNumber = '';
  cardName = '';
  cvv = '';
  expiry = '';
  upiId = 'johndoe@okhdfcbank';
  submitting = false;

  get finalTotalAmount(): number {
    const sub = this.cartService.subtotal();
    const total = sub + this.calculatedTax - this.discountAmount;
    return total > 0 ? Math.round(total) : 0;
  }

  ngOnInit() {
    this.cartService.loadCart();
  }

  toggleSavedAddress() {
    if (!this.useSavedAddress) {
      this.firstName = '';
      this.lastName = '';
      this.street = '';
      this.city = '';
      this.postalCode = '';
      this.phone = '';
      this.state = '';
    } else {
      this.firstName = 'John';
      this.lastName = 'Doe';
      this.street = '742 Evergreen Terrace, Apt 4B';
      this.email = 'john.doe@example.com';
      this.city = 'Springfield';
      this.postalCode = '97477';
      this.phone = '9876543210';
      this.state = 'Oregon';
    }
  }

  updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      this.cartService.removeItem(itemId).subscribe();
    } else {
      this.cartService.updateQuantity(itemId, quantity).subscribe();
    }
  }

  applyCoupon() {
    if (this.couponCode.trim()) {
      this.discountAmount = 100.0;
      this.toastService.show('Coupon applied! ₹100 discount added.', 'success');
    }
  }

  openPaymentModal() {
    this.showPaymentModal = true;
  }

  processPayment() {
    this.submitting = true;
    const addressData: Partial<Address> = {
      recipientName: `${this.firstName} ${this.lastName}`,
      street: this.street,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
    };

    this.orderService
      .createOrder({
        addressId: 'addr-1',
        paymentMethod: this.selectedTab.toUpperCase() === 'CREDIT' ? 'CREDIT_CARD' : 'DEBIT_CARD',
        cardNumber: this.cardNumber.replace(/\D/g, ''),
        redeemGiftPoints: this.discountAmount > 0 ? 100 : 0,
      })
      .subscribe({
        next: (order) => {
          this.submitting = false;
          this.showPaymentModal = false;
          this.cartService.clearCart().subscribe();
          this.router.navigate(['/order-confirm', order.id]);
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.show(err.error?.message || 'Payment processing failed', 'error');
        },
      });
  }
}
