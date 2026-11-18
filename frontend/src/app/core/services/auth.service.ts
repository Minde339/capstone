import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, UserProfile, Address } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api';
  private tokenKey = 'ebookstore_token';
  private userKey = 'ebookstore_user';

  currentUser = signal<UserProfile | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());
  isAuthenticated = computed(() => !!this.token());

  constructor(private http: HttpClient, private router: Router) {
    if (this.token()) {
      this.refreshProfile().subscribe({
        error: () => this.logout(),
      });
    }
  }

  private getStoredToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(this.tokenKey) : null;
  }

  private getStoredUser(): UserProfile | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  register(data: { email: string; password: string; fullName: string; phone?: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  refreshProfile() {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.userKey, JSON.stringify(user));
        }
      })
    );
  }

  private handleAuthSuccess(res: AuthResponse) {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
    }
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.router.navigate(['/login']);
  }

  getAddresses() {
    return this.http.get<Address[]>(`${this.apiUrl}/user/addresses`);
  }

  addAddress(address: Partial<Address>) {
    return this.http.post<Address>(`${this.apiUrl}/user/addresses`, address);
  }

  deleteAddress(id: string) {
    return this.http.delete(`${this.apiUrl}/user/addresses/${id}`);
  }
}
