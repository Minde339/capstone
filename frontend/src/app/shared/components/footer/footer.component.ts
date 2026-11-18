import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-wrapper">
      <div class="container footer-content">
        <div class="footer-col brand-col">
          <div class="footer-brand">
            <span class="footer-icon">📚</span>
            <strong>Cloud Bookstore</strong>
          </div>
          <p class="footer-desc">
            An enterprise E-Commerce platform for browsing, discovering, and purchasing books with AI-augmented order lifecycle and fast delivery.
          </p>
          <div class="footer-badges">
            <span class="badge badge-primary">Fastify Node.js</span>
            <span class="badge badge-success">PostgreSQL</span>
            <span class="badge badge-warning">Angular 17+</span>
          </div>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">Customer Journeys</h4>
          <ul class="footer-links">
            <li><a routerLink="/catalogue">Book Catalogue</a></li>
            <li><a routerLink="/checkout">Shopping Cart</a></li>
            <li><a routerLink="/orders">Order History & Re-order</a></li>
            <li><a routerLink="/orders">48-Hr Order Cancellation</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">Supported Publishers</h4>
          <ul class="footer-links">
            <li><span>O'Reilly Media</span></li>
            <li><span>Penguin Random House</span></li>
            <li><span>MIT Press</span></li>
            <li><span>HarperCollins</span></li>
            <li><span>Manning & Packt</span></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-title">Customer Assurance</h4>
          <ul class="footer-links">
            <li><span>✅ 48-Hour Free Cancellation</span></li>
            <li><span>🚚 Tentative Delivery Estimator</span></li>
            <li><span>🎁 Loyalty Reward Points</span></li>
            <li><span>🔒 256-bit Secure Checkout</span></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>© 2026 Cloud Bookstore Platform. All rights reserved.</p>
          <p>AI Specialist Capstone Project</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background-color: var(--gray-900);
      color: var(--gray-300);
      margin-top: auto;
      padding-top: 3.5rem;
      border-top: 1px solid var(--gray-800);
    }
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.2fr;
      gap: 2.5rem;
      padding-bottom: 3rem;
    }
    .brand-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ffffff;
      font-size: 1.2rem;
    }
    .footer-desc {
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--gray-400);
    }
    .footer-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .footer-title {
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .footer-links a {
      color: var(--gray-400);
      font-size: 0.875rem;
    }
    .footer-links a:hover {
      color: #ffffff;
    }
    .footer-links span {
      color: var(--gray-400);
      font-size: 0.875rem;
    }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.25rem 0;
      font-size: 0.8125rem;
      color: var(--gray-500);
    }
    .footer-bottom-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    @media (max-width: 900px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 600px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class FooterComponent {}
