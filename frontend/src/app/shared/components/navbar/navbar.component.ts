import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar-wrapper">
      <div class="navbar-content">
        <!-- Left: Logo & Brand -->
        <div class="brand-group">
          <a routerLink="/" class="brand-logo">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span class="brand-title">Book Worm</span>
          </a>

          <div class="brand-divider"></div>

          <!-- Top Navigation Links -->
          <nav class="nav-links">
            <a routerLink="/orders" class="nav-link" routerLinkActive="active">My Orders</a>
            <a routerLink="/catalogue" [queryParams]="{ filter: 'wishlist' }" class="nav-link">My Wishlist</a>
            <a routerLink="/catalogue" [queryParams]="{ filter: 'writers' }" class="nav-link">My Writers</a>
          </nav>
        </div>

        <!-- Right: Cart & Profile -->
        <div class="nav-actions">
          <a routerLink="/checkout" class="cart-btn" title="View Shopping Cart">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span class="cart-badge" *ngIf="cartService.itemCount() > 0">
              {{ cartService.itemCount() }}
            </span>
          </a>

          <!-- User Profile / Auth -->
          <ng-container *ngIf="authService.currentUser() as user; else guestNav">
            <div class="user-menu" [title]="user.fullName + ' (' + user.giftPoints + ' pts)'">
              <button class="profile-btn" (click)="toggleUserDropdown()">
                <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              <div class="user-dropdown" *ngIf="showDropdown">
                <div class="dropdown-header">
                  <strong>{{ user.fullName }}</strong>
                  <span class="dropdown-points">🎁 {{ user.giftPoints }} Points</span>
                </div>
                <a routerLink="/orders" class="dropdown-item" (click)="showDropdown = false">Order History</a>
                <button (click)="logout()" class="dropdown-item logout-item">Sign Out</button>
              </div>
            </div>
          </ng-container>

          <ng-template #guestNav>
            <a routerLink="/login" class="profile-btn" title="Sign In">
              <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </a>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background-color: #12161a;
      border-bottom: 1px solid #2d333b;
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }
    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 1.5rem;
      max-width: 100%;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
      color: #ffffff;
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.01em;
    }
    .brand-icon {
      width: 22px;
      height: 22px;
      color: #ffffff;
    }
    .brand-title {
      font-weight: 700;
    }
    .brand-divider {
      width: 1px;
      height: 24px;
      background-color: #30363d;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }
    .nav-link {
      color: #adbac7;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.15s ease;
    }
    .nav-link:hover, .nav-link.active {
      color: #ffffff;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cdd9e5;
      text-decoration: none;
      padding: 0.35rem;
      border-radius: 50%;
      transition: color 0.15s;
    }
    .cart-btn:hover {
      color: #ffffff;
    }
    .action-icon {
      width: 22px;
      height: 22px;
    }
    .cart-badge {
      position: absolute;
      top: -2px;
      right: -4px;
      background-color: #e5534b;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #12161a;
    }
    .profile-btn {
      background: none;
      border: none;
      color: #cdd9e5;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem;
      border-radius: 50%;
    }
    .profile-btn:hover {
      color: #ffffff;
    }
    .user-menu {
      position: relative;
    }
    .user-dropdown {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background-color: #1c2128;
      border: 1px solid #373e47;
      border-radius: 6px;
      min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 1100;
      padding: 0.5rem 0;
    }
    .dropdown-header {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid #30363d;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: #adbac7;
      font-size: 0.85rem;
    }
    .dropdown-points {
      color: #f69e46;
      font-weight: 600;
    }
    .dropdown-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 1rem;
      color: #adbac7;
      text-decoration: none;
      font-size: 0.85rem;
      background: none;
      border: none;
      cursor: pointer;
    }
    .dropdown-item:hover {
      background-color: #2d333b;
      color: #ffffff;
    }
    .logout-item {
      color: #f85149;
    }
  `],
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  router = inject(Router);

  showDropdown = false;

  toggleUserDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  logout() {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/catalogue']);
  }
}
