import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Book, Category } from '../../core/models/models';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="catalogue-layout">
      <!-- Left Sidebar Categories -->
      <aside class="sidebar-categories">
        <div class="category-list">
          <button
            class="category-item"
            [class.active]="selectedCategorySlug === 'all'"
            (click)="selectCategory('all')"
          >
            All
          </button>
          <button
            *ngFor="let cat of sidebarCategories"
            class="category-item"
            [class.active]="selectedCategorySlug === cat.slug"
            (click)="selectCategory(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </div>
      </aside>

      <!-- Main Catalogue Content Area -->
      <main class="catalogue-main">
        <!-- Top Filter & Search Bar -->
        <section class="top-filter-bar">
          <!-- Search Input -->
          <div class="filter-field search-field">
            <label class="filter-label">Search you want to read here</label>
            <div class="search-input-wrap">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onFilterChange()"
                placeholder="Search"
                class="filter-input search-input"
              />
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <!-- Language Dropdown -->
          <div class="filter-field">
            <label class="filter-label">Language</label>
            <div class="select-wrap">
              <select [(ngModel)]="selectedLanguage" (change)="onFilterChange()" class="filter-select">
                <option value="all">All</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Format Dropdown -->
          <div class="filter-field">
            <label class="filter-label">Format (Paperback, ebook etc)</label>
            <div class="select-wrap">
              <select [(ngModel)]="selectedFormat" (change)="onFilterChange()" class="filter-select">
                <option value="all">All</option>
                <option value="Paperback">Paperback</option>
                <option value="Hard Cover">Hard Cover</option>
                <option value="eBook">eBook</option>
                <option value="Hardcover">Hardcover</option>
              </select>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Price Range Dropdown -->
          <div class="filter-field">
            <label class="filter-label">Price Range</label>
            <div class="select-wrap">
              <select [(ngModel)]="selectedPriceRange" (change)="onFilterChange()" class="filter-select">
                <option value="all">All</option>
                <option value="under200">Under ₹200</option>
                <option value="200to400">₹200 - ₹400</option>
                <option value="above400">Above ₹400</option>
              </select>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Sort by Dropdown -->
          <div class="filter-field">
            <label class="filter-label">Sort by</label>
            <div class="select-wrap">
              <select [(ngModel)]="selectedSort" (change)="onFilterChange()" class="filter-select">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Highest Rating</option>
              </select>
              <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </section>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-wrap">
          <div class="spinner"></div>
          <span>Loading bookstore catalogue...</span>
        </div>

        <!-- Sectional View (When in default overview) -->
        <div *ngIf="!loading && !isFilteredView" class="sections-container">
          <!-- 1. Recommended for You -->
          <section class="book-section" *ngIf="recommendedBooks.length > 0">
            <h2 class="section-heading">Recommended for You</h2>
            <div class="books-grid">
              <article *ngFor="let book of recommendedBooks" class="book-card">
                <div class="cover-wrapper" [routerLink]="['/books', book.id]">
                  <img [src]="book.coverImageUrl" [alt]="book.title" class="book-cover-img" />
                </div>
                <div class="book-details">
                  <h3 class="book-title" [routerLink]="['/books', book.id]">{{ book.title }}</h3>
                  <div class="book-author">
                    by <a [routerLink]="['/catalogue']" [queryParams]="{ search: book.author }" class="author-link">{{ book.author }}</a>
                  </div>
                  <p class="book-desc">{{ book.description }}</p>
                  <div class="book-format">{{ book.format || 'Paperback' }}</div>
                  <div class="book-tags" *ngIf="book.tags && book.tags.length > 0">
                    <span *ngFor="let tag of book.tags; let last = last" class="tag-item">
                      {{ tag }}<span *ngIf="!last">, </span>
                    </span>
                  </div>
                  <div class="book-price">₹{{ book.price }}</div>
                  <div class="delivery-time">{{ book.tentativeDeliveryDate }}</div>
                  <div class="card-actions">
                    <button class="btn-add-cart" (click)="addToCart(book)" title="Add to Cart">
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- 2. Bestsellers this Month -->
          <section class="book-section" *ngIf="bestsellerBooks.length > 0">
            <h2 class="section-heading">Bestsellers this Month</h2>
            <div class="books-grid">
              <article *ngFor="let book of bestsellerBooks" class="book-card">
                <div class="cover-wrapper" [routerLink]="['/books', book.id]">
                  <img [src]="book.coverImageUrl" [alt]="book.title" class="book-cover-img" />
                </div>
                <div class="book-details">
                  <h3 class="book-title" [routerLink]="['/books', book.id]">{{ book.title }}</h3>
                  <div class="book-author">
                    by <a [routerLink]="['/catalogue']" [queryParams]="{ search: book.author }" class="author-link">{{ book.author }}</a>
                  </div>
                  <p class="book-desc">{{ book.description }}</p>
                  <div class="book-format">{{ book.format || 'Paperback' }}</div>
                  <div class="book-tags" *ngIf="book.tags && book.tags.length > 0">
                    <span *ngFor="let tag of book.tags; let last = last" class="tag-item">
                      {{ tag }}<span *ngIf="!last">, </span>
                    </span>
                  </div>
                  <div class="book-price">₹{{ book.price }}</div>
                  <div class="delivery-time">{{ book.tentativeDeliveryDate }}</div>
                  <div class="card-actions">
                    <button class="btn-add-cart" (click)="addToCart(book)" title="Add to Cart">
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- 3. New Launches -->
          <section class="book-section" *ngIf="newLaunchBooks.length > 0">
            <h2 class="section-heading">New Launches</h2>
            <div class="books-grid">
              <article *ngFor="let book of newLaunchBooks" class="book-card">
                <div class="cover-wrapper" [routerLink]="['/books', book.id]">
                  <img [src]="book.coverImageUrl" [alt]="book.title" class="book-cover-img" />
                </div>
                <div class="book-details">
                  <h3 class="book-title" [routerLink]="['/books', book.id]">{{ book.title }}</h3>
                  <div class="book-author">
                    by <a [routerLink]="['/catalogue']" [queryParams]="{ search: book.author }" class="author-link">{{ book.author }}</a>
                  </div>
                  <p class="book-desc">{{ book.description }}</p>
                  <div class="book-format">{{ book.format || 'Paperback' }}</div>
                  <div class="book-tags" *ngIf="book.tags && book.tags.length > 0">
                    <span *ngFor="let tag of book.tags; let last = last" class="tag-item">
                      {{ tag }}<span *ngIf="!last">, </span>
                    </span>
                  </div>
                  <div class="book-price">₹{{ book.price }}</div>
                  <div class="delivery-time">{{ book.tentativeDeliveryDate }}</div>
                  <div class="card-actions">
                    <button class="btn-add-cart" (click)="addToCart(book)" title="Add to Cart">
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <!-- Filtered Grid View (When search or category is active) -->
        <div *ngIf="!loading && isFilteredView" class="sections-container">
          <section class="book-section">
            <div class="filtered-header">
              <h2 class="section-heading">{{ getFilteredHeading() }}</h2>
              <span class="results-count">{{ filteredBooks.length }} titles found</span>
            </div>

            <div class="books-grid" *ngIf="filteredBooks.length > 0">
              <article *ngFor="let book of filteredBooks" class="book-card">
                <div class="cover-wrapper" [routerLink]="['/books', book.id]">
                  <img [src]="book.coverImageUrl" [alt]="book.title" class="book-cover-img" />
                </div>
                <div class="book-details">
                  <h3 class="book-title" [routerLink]="['/books', book.id]">{{ book.title }}</h3>
                  <div class="book-author">
                    by <a [routerLink]="['/catalogue']" [queryParams]="{ search: book.author }" class="author-link">{{ book.author }}</a>
                  </div>
                  <p class="book-desc">{{ book.description }}</p>
                  <div class="book-format">{{ book.format || 'Paperback' }}</div>
                  <div class="book-tags" *ngIf="book.tags && book.tags.length > 0">
                    <span *ngFor="let tag of book.tags; let last = last" class="tag-item">
                      {{ tag }}<span *ngIf="!last">, </span>
                    </span>
                  </div>
                  <div class="book-price">₹{{ book.price }}</div>
                  <div class="delivery-time">{{ book.tentativeDeliveryDate }}</div>
                  <div class="card-actions">
                    <button class="btn-add-cart" (click)="addToCart(book)" title="Add to Cart">
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <!-- Empty Search State -->
            <div *ngIf="filteredBooks.length === 0" class="empty-state">
              <p>No books found matching your current filter selection.</p>
              <button (click)="resetAllFilters()" class="btn-reset">Clear Filters</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #161616;
      color: #f4f4f4;
      min-height: calc(100vh - 56px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .catalogue-layout {
      display: flex;
      min-height: calc(100vh - 56px);
    }

    /* Left Sidebar */
    .sidebar-categories {
      width: 240px;
      min-width: 240px;
      background-color: #161616;
      border-right: 1px solid #262626;
      padding: 0.5rem 0;
    }

    .category-list {
      display: flex;
      flex-direction: column;
    }

    .category-item {
      display: block;
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      color: #c6c6c6;
      padding: 0.6rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }

    .category-item:hover {
      background-color: #262626;
      color: #ffffff;
    }

    .category-item.active {
      background-color: #393939;
      color: #ffffff;
      font-weight: 600;
    }

    /* Main Content */
    .catalogue-main {
      flex: 1;
      background-color: #161616;
      padding: 1rem 1.75rem 3rem 1.75rem;
      overflow-x: hidden;
    }

    /* Top Filter Bar */
    .top-filter-bar {
      display: grid;
      grid-template-columns: 2fr 1fr 1.3fr 1fr 1fr;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #262626;
      margin-bottom: 2rem;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .filter-label {
      font-size: 0.75rem;
      color: #8d8d8d;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-input-wrap, .select-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .filter-input, .filter-select {
      width: 100%;
      height: 38px;
      background-color: #262626;
      border: 1px solid #393939;
      border-radius: 4px;
      color: #f4f4f4;
      font-size: 0.85rem;
      padding: 0 0.75rem;
      outline: none;
      transition: border-color 0.15s;
      appearance: none;
    }

    .filter-input:focus, .filter-select:focus {
      border-color: #0f62fe;
    }

    .search-input {
      padding-right: 2rem;
    }

    .search-icon {
      position: absolute;
      right: 0.65rem;
      width: 16px;
      height: 16px;
      color: #8d8d8d;
      pointer-events: none;
    }

    .chevron-icon {
      position: absolute;
      right: 0.65rem;
      width: 14px;
      height: 14px;
      color: #8d8d8d;
      pointer-events: none;
    }

    /* Sections */
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .section-heading {
      font-size: 1.15rem;
      font-weight: 600;
      color: #f4f4f4;
      margin-bottom: 1.25rem;
    }

    .filtered-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .results-count {
      color: #8d8d8d;
      font-size: 0.85rem;
    }

    /* Books Grid (3 items per row matching PowerPoint) */
    .books-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1200px) {
      .books-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .top-filter-bar {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .catalogue-layout {
        flex-direction: column;
      }
      .sidebar-categories {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #262626;
      }
      .books-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Book Card */
    .book-card {
      display: flex;
      gap: 1rem;
      background-color: transparent;
      padding: 0.5rem;
      border-radius: 4px;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    .book-card:hover {
      background-color: #212121;
    }

    .cover-wrapper {
      width: 125px;
      min-width: 125px;
      height: 180px;
      cursor: pointer;
      border-radius: 2px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .book-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .book-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .book-title {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 0.2rem 0;
      cursor: pointer;
      line-height: 1.3;
    }

    .book-title:hover {
      color: #78a9ff;
    }

    .book-author {
      font-size: 0.8rem;
      color: #8d8d8d;
      margin-bottom: 0.35rem;
    }

    .author-link {
      color: #78a9ff;
      text-decoration: none;
    }

    .author-link:hover {
      text-decoration: underline;
    }

    .book-desc {
      font-size: 0.75rem;
      color: #c6c6c6;
      line-height: 1.35;
      margin: 0 0 0.35rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .book-format {
      font-size: 0.75rem;
      color: #8d8d8d;
      margin-bottom: 0.2rem;
    }

    .book-tags {
      font-size: 0.75rem;
      color: #78a9ff;
      margin-bottom: 0.4rem;
    }

    .tag-item {
      cursor: pointer;
    }

    .tag-item:hover {
      text-decoration: underline;
    }

    .book-price {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin-top: auto;
      margin-bottom: 0.15rem;
    }

    .delivery-time {
      font-size: 0.72rem;
      color: #c6c6c6;
      margin-bottom: 0.4rem;
    }

    .card-actions {
      display: flex;
      align-items: center;
    }

    .btn-add-cart {
      background-color: #0f62fe;
      color: #ffffff;
      border: none;
      border-radius: 3px;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .btn-add-cart:hover {
      background-color: #0043ce;
    }

    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #8d8d8d;
      gap: 1rem;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #393939;
      border-top-color: #0f62fe;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: #8d8d8d;
    }

    .btn-reset {
      background-color: #393939;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      cursor: pointer;
    }
  `],
})
export class CatalogueComponent implements OnInit {
  bookService = inject(BookService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  sidebarCategories: { name: string; slug: string }[] = [
    { name: 'Romance', slug: 'cat-romance' },
    { name: 'Mystery', slug: 'cat-mystery' },
    { name: 'Science Fiction', slug: 'cat-scifi' },
    { name: 'Fantasy', slug: 'cat-fantasy' },
    { name: 'Historical', slug: 'cat-historical' },
    { name: 'Biography', slug: 'cat-biography' },
    { name: 'Self-help', slug: 'cat-selfhelp' },
    { name: 'Memoir', slug: 'cat-memoir' },
    { name: 'Travel', slug: 'cat-travel' },
    { name: 'Cooking', slug: 'cat-cooking' },
    { name: "Children's", slug: 'cat-children' },
    { name: 'Young Adult', slug: 'cat-youngadult' },
    { name: 'Comics & Graphic Novels', slug: 'cat-comics' },
    { name: 'Poetry', slug: 'cat-poetry' },
    { name: 'Drama', slug: 'cat-drama' },
    { name: 'Science', slug: 'cat-science' },
    { name: 'Philosophy', slug: 'cat-philosophy' },
    { name: 'Religion', slug: 'cat-religion' },
    { name: 'Language Learning', slug: 'cat-languages' },
  ];

  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  recommendedBooks: Book[] = [];
  bestsellerBooks: Book[] = [];
  newLaunchBooks: Book[] = [];

  selectedCategorySlug = 'all';
  searchQuery = '';
  selectedLanguage = 'all';
  selectedFormat = 'all';
  selectedPriceRange = 'all';
  selectedSort = 'relevance';

  loading = true;

  get isFilteredView(): boolean {
    return (
      this.selectedCategorySlug !== 'all' ||
      this.searchQuery.trim().length > 0 ||
      this.selectedLanguage !== 'all' ||
      this.selectedFormat !== 'all' ||
      this.selectedPriceRange !== 'all' ||
      this.selectedSort !== 'relevance'
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['category']) {
        this.selectedCategorySlug = params['category'];
      }
      this.loadBooks();
    });
  }

  loadBooks() {
    this.loading = true;
    this.bookService.getBooks({}).subscribe({
      next: (books) => {
        this.allBooks = books;
        this.distributeSections();
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load books', err);
        this.loading = false;
      },
    });
  }

  distributeSections() {
    this.recommendedBooks = this.allBooks.filter(
      (b) => b.section === 'recommended' || b.id === 'book-1' || b.id === 'book-2' || b.id === 'book-3'
    ).slice(0, 3);

    this.bestsellerBooks = this.allBooks.filter(
      (b) => b.section === 'bestsellers' || b.id === 'book-4' || b.id === 'book-5' || b.id === 'book-6'
    ).slice(0, 3);

    this.newLaunchBooks = this.allBooks.filter(
      (b) => b.section === 'new_launches' || b.id === 'book-7' || b.id === 'book-8' || b.id === 'book-9'
    ).slice(0, 3);
  }

  selectCategory(slug: string) {
    this.selectedCategorySlug = slug;
    this.onFilterChange();
  }

  onFilterChange() {
    this.applyLocalFilters();
  }

  applyLocalFilters() {
    let list = [...this.allBooks];

    // Category
    if (this.selectedCategorySlug !== 'all') {
      list = list.filter((b) => b.categoryId === this.selectedCategorySlug);
    }

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Language
    if (this.selectedLanguage !== 'all') {
      list = list.filter((b) => !b.language || b.language === this.selectedLanguage);
    }

    // Format
    if (this.selectedFormat !== 'all') {
      list = list.filter((b) => b.format?.toLowerCase() === this.selectedFormat.toLowerCase());
    }

    // Price Range
    if (this.selectedPriceRange === 'under200') {
      list = list.filter((b) => b.price < 200);
    } else if (this.selectedPriceRange === '200to400') {
      list = list.filter((b) => b.price >= 200 && b.price <= 400);
    } else if (this.selectedPriceRange === 'above400') {
      list = list.filter((b) => b.price > 400);
    }

    // Sort
    if (this.selectedSort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.selectedSort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.selectedSort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    }

    this.filteredBooks = list;
  }

  getFilteredHeading(): string {
    if (this.selectedCategorySlug !== 'all') {
      const found = this.sidebarCategories.find((c) => c.slug === this.selectedCategorySlug);
      return found ? found.name : 'Category Results';
    }
    if (this.searchQuery) {
      return `Search Results for "${this.searchQuery}"`;
    }
    return 'Filtered Results';
  }

  resetAllFilters() {
    this.selectedCategorySlug = 'all';
    this.searchQuery = '';
    this.selectedLanguage = 'all';
    this.selectedFormat = 'all';
    this.selectedPriceRange = 'all';
    this.selectedSort = 'relevance';
    this.applyLocalFilters();
  }

  addToCart(book: Book) {
    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please sign in to add items to your cart', 'info');
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.addToCart(book.id, 1).subscribe({
      next: () => {
        this.toastService.show(`"${book.title}" added to cart!`, 'success');
      },
      error: () => {
        this.toastService.show('Failed to add item to cart', 'error');
      },
    });
  }
}
