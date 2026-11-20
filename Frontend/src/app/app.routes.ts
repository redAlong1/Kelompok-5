import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog.component')
        .then(m => m.CatalogComponent)
  },

  {
    path: 'reservations',
    loadComponent: () =>
      import('./pages/reservation/reservation.component')
        .then(m => m.ReservationComponent)
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
    redirectTo: 'dashboard'
  }
];
