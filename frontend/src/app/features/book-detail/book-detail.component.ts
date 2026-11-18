import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Book, BookDetail, Review } from '../../core/models/models';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="detail-page" *ngIf="book">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <a routerLink="/">Home</a>
        <span class="separator">/</span>
        <a routerLink="/catalogue">{{ book.categoryName || 'Books' }}</a>
        <span class="separator">/</span>
        <span class="current">{{ book.tags && book.tags.length > 0 ? book.tags[0] : book.title }}</span>
      </nav>

      <div class="page-grid">
        <!-- Main Column -->
        <div class="main-col">
          <div class="product-row">
            <div class="cover-box">
              <img [src]="book.coverImageUrl" [alt]="book.title" class="book-main-cover" />
            </div>

            <div class="product-info">
              <h1 class="book-title">{{ book.title }}</h1>
              <div class="book-author">by <a class="link">{{ book.author }}</a></div>
              <p class="book-desc">{{ book.description }}</p>

              <div class="published-by">
                Published by: <a class="link">{{ book.publisherName }}</a>
              </div>

              <div class="book-format">{{ book.format || 'Paperback' }}</div>
              <div class="book-tags" *ngIf="book.tags && book.tags.length > 0">
                <span *ngFor="let tag of book.tags; let last = last">
                  <a class="link">{{ tag }}</a><span *ngIf="!last">, </span>
                </span>
              </div>

              <div class="book-price">₹{{ book.price }}</div>
              <div class="delivery-date">
                Delivery by <strong>{{ book.tentativeDeliveryDateIso | date: 'EEE, d MMM' }}</strong>
              </div>
              <div class="stock-out" *ngIf="book.stockQuantity <= 0">Out of stock</div>

              <div class="action-row">
                <button class="btn-add-cart" [disabled]="book.stockQuantity <= 0" (click)="addToCart()">
                  <span>Add to Cart</span>
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </button>
                <button class="btn-wishlist" (click)="toggleWishlist()">
                  <span>{{ inWishlist ? 'In Wishlist' : 'Add to Wishlist' }}</span>
                  <svg class="btn-icon" viewBox="0 0 24 24" [attr.fill]="inWishlist ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>

              <div class="stats-row">
                <div class="stat">
                  <span class="stat-label">Language</span>
                  <a class="link">{{ book.language || 'English' }}</a>
                </div>
                <div class="stat">
                  <span class="stat-label">Rating</span>
                  <span class="stars">{{ starString(book.rating) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Ratings</span>
                  <strong>{{ book.reviewCount }} reviews</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- About the writer -->
          <section class="writer-section">
            <h2 class="section-heading">About the writer</h2>
            <div class="writer-row">
              <div class="writer-avatar">{{ book.author.charAt(0) }}</div>
              <div class="writer-info">
                <h3>{{ book.author }}</h3>
                <p>
                  {{ book.author }} is the author of {{ book.title }}, published by {{ book.publisherName }}.
                </p>
              </div>
            </div>
          </section>

          <!-- Reviews -->
          <section class="reviews-section">
            <h2 class="section-heading">Reviews</h2>
            <div class="reviews-grid">
              <div class="review-form">
                <div class="form-label-row">
                  <label for="reviewText">Leave Your Review</label>
                  <span>{{ reviewText.length }}/100</span>
                </div>
                <textarea
                  id="reviewText"
                  class="review-textarea"
                  maxlength="100"
                  placeholder="Placeholder text"
                  [(ngModel)]="reviewText"
                ></textarea>
                <div class="form-footer">
                  <div class="star-picker">
                    <button
                      *ngFor="let s of [1, 2, 3, 4, 5]"
                      type="button"
                      class="star-btn"
                      [attr.aria-label]="s + ' star'"
                      (click)="reviewRating = s"
                    >
                      {{ s <= reviewRating ? '★' : '☆' }}
                    </button>
                  </div>
                  <button class="btn-submit" (click)="submitReview()">
                    <span>Submit</span>
                    <span class="arrow">→</span>
                  </button>
                </div>
              </div>

              <div class="review-list">
                <div *ngIf="book.reviews.length === 0" class="no-reviews">
                  No customer reviews yet. Be the first to review this book!
                </div>
                <div *ngFor="let rev of book.reviews" class="review-item">
                  <h4 class="review-user">{{ rev.userName }}</h4>
                  <p class="review-comment">{{ rev.comment }}</p>
                  <div class="stars">{{ starString(rev.rating) }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Related Reads Sidebar -->
        <aside class="related-col">
          <h2 class="section-heading">Related Reads</h2>
          <div class="related-empty" *ngIf="relatedBooks.length === 0">No related books yet.</div>
          <article *ngFor="let rel of relatedBooks" class="related-card" [routerLink]="['/books', rel.id]">
            <div class="related-cover">
              <img [src]="rel.coverImageUrl" [alt]="rel.title" />
            </div>
            <div class="related-body">
              <h3 class="related-title">{{ rel.title }}</h3>
              <div class="related-author">by <span class="link">{{ rel.author }}</span></div>
              <p class="related-desc">{{ rel.description }}</p>
              <div class="related-format">{{ rel.format || 'Paperback' }}</div>
              <div class="related-tags" *ngIf="rel.tags && rel.tags.length > 0">
                <span *ngFor="let tag of rel.tags; let last = last">
                  <span class="link">{{ tag }}</span><span *ngIf="!last">, </span>
                </span>
              </div>
              <div class="related-price">₹{{ rel.price }}</div>
              <div class="delivery-date">
                Delivery by <strong>{{ rel.tentativeDeliveryDateIso | date: 'EEE, d MMM' }}</strong>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #161616;
      color: #f4f4f4;
      min-height: calc(100vh - 56px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .detail-page {
      padding: 1rem 1.5rem 4rem;
    }

    .link {
      color: #78a9ff;
      text-decoration: underline;
      cursor: pointer;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.95rem;
      margin-bottom: 1.25rem;
    }

    .breadcrumb-nav a {
      color: #78a9ff;
      text-decoration: none;
    }

    .breadcrumb-nav .separator {
      color: #8d8d8d;
    }

    .breadcrumb-nav .current {
      color: #f4f4f4;
    }

    .page-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
    }

    .related-col {
      border-left: 1px solid #393939;
      padding-left: 1.25rem;
    }

    .section-heading {
      font-size: 1.35rem;
      font-weight: 400;
      color: #f4f4f4;
      margin: 0 0 1.25rem 0;
    }

    /* Product row */
    .product-row {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }

    .cover-box {
      width: 272px;
      min-width: 272px;
      height: 406px;
    }

    .book-main-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .book-title {
      font-size: 1.5rem;
      font-weight: 400;
      margin: 0 0 0.5rem 0;
    }

    .book-author {
      font-size: 0.95rem;
      margin-bottom: 0.65rem;
    }

    .book-desc {
      font-size: 0.85rem;
      color: #c6c6c6;
      margin: 0 0 1.25rem 0;
      line-height: 1.4;
    }

    .published-by {
      font-size: 0.8rem;
      margin-bottom: 1.25rem;
    }

    .book-format {
      font-size: 0.85rem;
      margin-bottom: 0.6rem;
    }

    .book-tags {
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .book-price {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1.1;
    }

    .delivery-date {
      font-size: 0.8rem;
      color: #c6c6c6;
    }

    .delivery-date strong {
      color: #ffffff;
    }

    .stock-out {
      color: #fa4d56;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .action-row {
      display: flex;
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .btn-add-cart,
    .btn-wishlist {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      height: 50px;
      padding: 0 1rem;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      cursor: pointer;
    }

    .btn-add-cart {
      background-color: #0f62fe;
      min-width: 160px;
    }

    .btn-add-cart:hover:not(:disabled) {
      background-color: #0043ce;
    }

    .btn-add-cart:disabled {
      background-color: #393939;
      color: #8d8d8d;
      cursor: not-allowed;
    }

    .btn-wishlist {
      background-color: #525252;
      min-width: 185px;
    }

    .btn-wishlist:hover {
      background-color: #636363;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
    }

    .stats-row {
      display: flex;
      gap: 2.5rem;
      font-size: 0.9rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-label {
      color: #f4f4f4;
    }

    .stars {
      color: #f1c21b;
      letter-spacing: 0.1em;
    }

    /* Writer */
    .writer-section {
      margin-bottom: 2.5rem;
    }

    .writer-row {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
    }

    .writer-avatar {
      width: 122px;
      min-width: 122px;
      height: 122px;
      border-radius: 50%;
      background-color: #393939;
      color: #ffffff;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .writer-info h3 {
      font-size: 1.35rem;
      font-weight: 400;
      margin: 0 0 0.6rem 0;
    }

    .writer-info p {
      font-size: 0.85rem;
      color: #c6c6c6;
      line-height: 1.4;
      margin: 0;
    }

    /* Reviews */
    .reviews-grid {
      display: grid;
      grid-template-columns: 466px 1fr;
      gap: 2.5rem;
    }

    .form-label-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #c6c6c6;
      margin-bottom: 0.5rem;
    }

    .review-textarea {
      width: 100%;
      height: 170px;
      box-sizing: border-box;
      background-color: #262626;
      border: none;
      border-bottom: 1px solid #8d8d8d;
      color: #ffffff;
      padding: 0.9rem 1rem;
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      outline: none;
    }

    .review-textarea:focus {
      border-bottom-color: #0f62fe;
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .star-picker {
      display: flex;
      gap: 0.35rem;
    }

    .star-btn {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.6rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
      width: 139px;
      height: 50px;
      padding: 0 1rem;
      background-color: #0f62fe;
      border: none;
      color: #ffffff;
      font-size: 0.95rem;
      cursor: pointer;
    }

    .btn-submit:hover {
      background-color: #0043ce;
    }

    .review-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-top: 1.75rem;
    }

    .review-user {
      font-size: 1.05rem;
      font-weight: 400;
      margin: 0 0 0.6rem 0;
    }

    .review-comment {
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .no-reviews {
      color: #c6c6c6;
      font-size: 0.9rem;
    }

    /* Related */
    .related-card {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      cursor: pointer;
    }

    .related-cover {
      width: 147px;
      min-width: 147px;
      height: 220px;
    }

    .related-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .related-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .related-title {
      font-size: 1.35rem;
      font-weight: 400;
      margin: 0 0 0.5rem 0;
    }

    .related-author {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .related-desc {
      font-size: 0.8rem;
      color: #c6c6c6;
      line-height: 1.35;
      margin: 0 0 0.75rem 0;
    }

    .related-format {
      font-size: 0.8rem;
      margin-bottom: 0.35rem;
    }

    .related-tags {
      font-size: 0.8rem;
      margin-bottom: 0.65rem;
    }

    .related-price {
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: auto;
    }

    .related-empty {
      color: #c6c6c6;
      font-size: 0.9rem;
    }

    @media (max-width: 1100px) {
      .page-grid {
        grid-template-columns: 1fr;
      }
      .related-col {
        border-left: none;
        padding-left: 0;
      }
      .reviews-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 700px) {
      .product-row {
        flex-direction: column;
      }
    }
  `],
})
export class BookDetailComponent implements OnInit {
  bookService = inject(BookService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  book: BookDetail | null = null;
  relatedBooks: Book[] = [];
  inWishlist = false;
  reviewText = '';
  reviewRating = 0;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const bookId = params['id'];
      if (bookId) {
        this.loadBook(bookId);
      }
    });
  }

  loadBook(id: string) {
    this.bookService.getBookById(id).subscribe({
      next: (b) => {
        this.book = b;
        this.inWishlist = false;
        this.reviewText = '';
        this.reviewRating = 0;
        this.loadRelated(id);
      },
      error: () => {
        this.toastService.error('Book not found');
        this.router.navigate(['/catalogue']);
      },
    });
  }

  loadRelated(id: string) {
    this.bookService.getRelatedBooks(id).subscribe((res) => (this.relatedBooks = res));
  }

  starString(rating: number): string {
    const full = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  toggleWishlist() {
    this.inWishlist = !this.inWishlist;
    this.toastService.info(this.inWishlist ? 'Added to wishlist' : 'Removed from wishlist');
  }

  submitReview() {
    if (!this.book) return;
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Please sign in to leave a review');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.reviewText.trim() || this.reviewRating === 0) {
      this.toastService.error('Please add a rating and a comment');
      return;
    }

    const review: Review = {
      id: `local-${Date.now()}`,
      userName: this.authService.currentUser()?.fullName || 'You',
      rating: this.reviewRating,
      comment: this.reviewText.trim(),
      createdAt: new Date().toISOString(),
    };
    this.book.reviews = [review, ...this.book.reviews];
    this.reviewText = '';
    this.reviewRating = 0;
    this.toastService.success('Thanks for your review!');
  }

  addToCart() {
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('Please sign in to add items to your cart');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.book) return;

    this.cartService.addToCart(this.book.id, 1).subscribe({
      next: () => {
        this.toastService.success('Added 1 item to basket!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Could not add to cart');
      },
    });
  }
}
