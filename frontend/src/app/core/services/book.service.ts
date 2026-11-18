import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookDetail, Category, Publisher } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getPublishers(): Observable<Publisher[]> {
    return this.http.get<Publisher[]>(`${this.apiUrl}/publishers`);
  }

  getBooks(filter: {
    search?: string;
    categoryId?: string;
    publisherId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  } = {}): Observable<Book[]> {
    let params = new HttpParams();
    if (filter.search) params = params.set('search', filter.search);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.publisherId) params = params.set('publisherId', filter.publisherId);
    if (filter.minPrice !== undefined) params = params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice !== undefined) params = params.set('maxPrice', filter.maxPrice.toString());
    if (filter.sort) params = params.set('sort', filter.sort);

    return this.http.get<Book[]>(`${this.apiUrl}/books`, { params });
  }

  getBookById(id: string): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.apiUrl}/books/${id}`);
  }

  getRelatedBooks(id: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books/${id}/related`);
  }

  getRecommendations(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books/recommendations`);
  }
}
