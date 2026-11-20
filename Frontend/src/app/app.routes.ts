
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
    path: 'publisher',
    loadComponent: () =>
      import('./pages/publisher/publisher.component')
        .then(m => m.PublisherComponent)
  },

  {
    path: 'author',
    loadComponent: () =>
      import('./pages/author/author.component')
        .then(m => m.AuthorComponent)
  },

  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category.component')
        .then(m => m.CategoryComponent)
  },

  {
    path: 'books-master',
    loadComponent: () =>
      import('./pages/book-master/book-master.component')
        .then(m => m.BookMasterComponent)
  },

  {
    path: 'inventory',
    loadComponent: () =>
      import('./pages/inventory/inventory.component')
        .then(m => m.InventoryComponent)
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
