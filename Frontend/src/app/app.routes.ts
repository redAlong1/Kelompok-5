
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [

  // ========== PUBLIC PAGES (NO HEADER / SIDEBAR) ==========

  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    component: LandingComponent
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

  // ========== DASHBOARD LAYOUT (WITH HEADER / SIDEBAR) ==========

  {
    path: '',
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout.component')
        .then(m => m.DashboardLayoutComponent),

    children: [

      // USER / MEMBER ROUTES

      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'catalog',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/catalog/catalog.component')
            .then(m => m.CatalogComponent)
      },
      {
        path: 'reservations',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/reservation/reservation.component')
            .then(m => m.ReservationComponent)
      },
      {
        path: 'books/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/book-detail/book-detail.component')
            .then(m => m.BookDetailComponent)
      },
      {
        path: 'my-borrowings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/my-borrowings/my-borrowings.component')
            .then(m => m.MyBorrowingsComponent)
      },
      {
        path: 'my-fines',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/my-fines/my-fines.component')
            .then(m => m.MyFinesComponent)
      },

      // ADMIN ONLY ROUTES

      {
        path: 'admin/return',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin-return/admin-return.component')
            .then(m => m.AdminReturnComponent)
      },
      {
        path: 'admin/fines',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin-fines/admin-fines.component')
            .then(m => m.AdminFinesComponent)
      },
      {
        path: 'admin/borrowings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin-borrowings/admin-borrowings.component')
            .then(m => m.AdminBorrowingsComponent)
      },
      {
        path: 'books-master',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/book-master/book-master.component')
            .then(m => m.BookMasterComponent)
      },
      {
        path: 'inventory',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/inventory/inventory.component')
            .then(m => m.InventoryComponent)
      },
      {
        path: 'author',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/author/author.component')
            .then(m => m.AuthorComponent)
      },
      {
        path: 'publisher',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/publisher/publisher.component')
            .then(m => m.PublisherComponent)
      },
      {
        path: 'category',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/category/category.component')
            .then(m => m.CategoryComponent)
      }
    ]
  },

  // ========== ERROR PAGES ==========

  {
    path: '403',
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent)
  },

  // ========== FALLBACK ==========

  {
    path: '**',
    redirectTo: 'landing'
  }
];
