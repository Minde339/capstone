import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalogue',
    pathMatch: 'full',
  },
  {
    path: 'catalogue',
    loadComponent: () =>
      import('./features/catalogue/catalogue.component').then((m) => m.CatalogueComponent),
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./features/book-detail/book-detail.component').then((m) => m.BookDetailComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [authGuard],
  },
  {
    path: 'order-confirm/:id',
    loadComponent: () =>
      import('./features/order-confirm/order-confirm.component').then((m) => m.OrderConfirmComponent),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/order-history/order-history.component').then((m) => m.OrderHistoryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '**',
    redirectTo: 'catalogue',
  },
];
