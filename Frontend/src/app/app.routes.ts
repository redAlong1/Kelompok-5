
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component')
        .then(m => m.LandingComponent)
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./pages/book-detail/book-detail.component')
        .then(m => m.BookDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
