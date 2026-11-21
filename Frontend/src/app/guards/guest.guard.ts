import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isTokenExpired } from '../utils/token.util';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!token) {
    return true;
  }

  if (isTokenExpired(token)) {
    if (typeof (auth as any).logout === 'function') {
      (auth as any).logout();
    } else {
      localStorage.removeItem('token');
    }
    return router.createUrlTree(['/login']);
  }

  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
