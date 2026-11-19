
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
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/books.component')
        .then(m => m.BooksComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
