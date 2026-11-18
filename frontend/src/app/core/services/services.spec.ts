import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { of } from 'rxjs';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should add success toast and remove after timeout', () => {
    service.success('Order placed!');
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].text).toBe('Order placed!');
    expect(service.toasts()[0].type).toBe('success');

    service.remove(service.toasts()[0].id);
    expect(service.toasts().length).toBe(0);
  });

  it('should add error and info toasts', () => {
    service.error('Failed to cancel');
    service.info('Basket updated');
    expect(service.toasts().length).toBe(2);
    expect(service.toasts()[0].type).toBe('error');
    expect(service.toasts()[1].type).toBe('info');
  });
});

describe('AuthService Logic', () => {
  let service: AuthService;
  let mockHttp: any;
  let mockRouter: any;

  beforeEach(() => {
    mockHttp = {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    localStorage.clear();
    service = new AuthService(mockHttp, mockRouter);
  });

  it('should store token and user on successful login', () => {
    const mockResponse = {
      token: 'jwt-token-123',
      user: {
        id: 'user-1',
        email: 'john@example.com',
        fullName: 'John Doe',
        giftPoints: 250,
      },
    };

    mockHttp.post.mockReturnValue(of(mockResponse));

    service.login({ email: 'john@example.com', password: 'Password123!' }).subscribe((res) => {
      expect(res.token).toBe('jwt-token-123');
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.fullName).toBe('John Doe');
      expect(service.currentUser()?.giftPoints).toBe(250);
    });
  });

  it('should clear state on logout and redirect to /login', () => {
    service.token.set('token');
    service.currentUser.set({ id: '1', email: 'a@a.com', fullName: 'A', giftPoints: 100 });

    service.logout();
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});

describe('CartService Logic', () => {
  let cartService: CartService;
  let mockHttp: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockHttp = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
    };

    cartService = new CartService(mockHttp, mockAuthService);
  });

  it('should update computed total and item count when cart updates', () => {
    const mockCart = {
      id: 'cart-1',
      items: [
        {
          id: 'item-1',
          bookId: 'book-1',
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          coverImageUrl: '',
          price: 44.99,
          quantity: 2,
          stockQuantity: 10,
          totalPrice: 89.98,
        },
      ],
      subtotal: 89.98,
      itemCount: 2,
    };

    mockHttp.post.mockReturnValue(of(mockCart));

    cartService.addToCart('book-1', 2).subscribe(() => {
      expect(cartService.subtotal()).toBe(89.98);
      expect(cartService.itemCount()).toBe(2);
    });
  });
});
