import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isTokenExpired } from '../utils/token.util';

function clearStoredToken(): void {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token =
    localStorage.getItem('token') ?? sessionStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    if (isTokenExpired(token)) {
      clearStoredToken();
      if (!req.url.includes('/login')) {
        router.navigate(['/login']);
      }
    } else {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        clearStoredToken();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        router.navigate(['/403']);
      }
      return throwError(() => error);
    }),
  );
};
