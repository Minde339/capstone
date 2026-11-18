import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-backdrop">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Sign in</h2>
          <p>Welcome back to Book Worm</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="form-control"
              placeholder="e.g. john.doe@example.com"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              class="form-control"
              placeholder="Password"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn-submit">
            <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            <span>→</span>
          </button>
        </form>

        <div class="demo-helpers">
          <span class="demo-title">Quick demo logins</span>
          <div class="demo-buttons">
            <button type="button" (click)="fillDemo('john.doe@example.com')" class="btn-demo">
              John Doe (250 pts)
            </button>
            <button type="button" (click)="fillDemo('alice.smith@example.com')" class="btn-demo">
              Alice Smith (100 pts)
            </button>
          </div>
        </div>

        <div class="auth-footer">
          <span>Don't have an account? </span>
          <a routerLink="/register">Create an account</a>
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

    .auth-backdrop {
      min-height: calc(100vh - 56px);
      background-color: #161616;
      background-image: url('/assets/images/book-pattern-bg.svg');
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
    }

    .auth-card {
      background-color: #262626;
      width: 100%;
      max-width: 440px;
      padding: 2.25rem 2.25rem 2rem;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
      color: #f4f4f4;
    }

    .auth-header {
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #0f62fe;
    }

    .auth-header h2 {
      font-size: 1.5rem;
      font-weight: 400;
      color: #ffffff;
      margin: 0 0 0.4rem 0;
    }

    .auth-header p {
      font-size: 0.85rem;
      color: #c6c6c6;
      margin: 0;
    }

    .auth-header strong {
      color: #ffffff;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.75rem;
      color: #c6c6c6;
    }

    .form-control {
      background-color: #393939;
      border: none;
      border-bottom: 1px solid #8d8d8d;
      border-radius: 0;
      color: #ffffff;
      height: 44px;
      padding: 0 1rem;
      font-size: 0.9rem;
      outline: none;
    }

    .form-control::placeholder {
      color: #8d8d8d;
    }

    .form-control:focus {
      border-bottom-color: #0f62fe;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 50px;
      padding: 0 1rem;
      margin-top: 0.5rem;
      background-color: #0f62fe;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      cursor: pointer;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #0043ce;
    }

    .btn-submit:disabled {
      background-color: #393939;
      color: #8d8d8d;
      cursor: not-allowed;
    }

    .demo-helpers {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #393939;
    }

    .demo-title {
      display: block;
      font-size: 0.75rem;
      color: #c6c6c6;
      margin-bottom: 0.6rem;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-demo {
      height: 40px;
      padding: 0 1rem;
      background-color: #393939;
      border: none;
      color: #f4f4f4;
      font-size: 0.85rem;
      text-align: left;
      cursor: pointer;
    }

    .btn-demo:hover {
      background-color: #4c4c4c;
    }

    .auth-footer {
      margin-top: 1.5rem;
      font-size: 0.85rem;
      color: #c6c6c6;
    }

    .auth-footer a {
      color: #78a9ff;
      text-decoration: underline;
    }
  `],
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  cartService = inject(CartService);
  router = inject(Router);

  email = 'john.doe@example.com';
  password = 'Password123!';
  loading = false;

  fillDemo(email: string) {
    this.email = email;
    this.password = 'Password123!';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.toastService.error('Please enter email and password');
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.success(`Welcome back, ${res.user.fullName}!`);
        this.cartService.loadCart();
        this.router.navigate(['/catalogue']);
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Invalid credentials');
      },
    });
  }
}
