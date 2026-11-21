import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isTokenExpired } from '../utils/token.util';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!auth.isLoggedIn() || isTokenExpired(token)) {
    if (typeof (auth as any).logout === 'function') {
      (auth as any).logout();
    } else {
      localStorage.removeItem('token');
    }
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (!auth.isAdmin()) {
    return router.createUrlTree(['/403']);
  }

  return true;
};
