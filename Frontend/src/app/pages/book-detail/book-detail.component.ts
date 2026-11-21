
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  BookService,
  BookResponse
} from '../../services/book.service';

import {
  InventoryService,
  InventoryResponse
} from '../../services/inventory.service';

import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface BookDetail {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number | string;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  coverClass: string;
  coverUrl?: string;
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {

  bookId = 1;

  isFavorite = false;
  loading = false;
  errorMessage = '';

  book: BookDetail = {
    id: 1,
    title: 'Memuat...',
    author: '-',
    isbn: '-',
    category: '-',
    publisher: '-',
    year: '-',
    stock: 0,
    rating: 4.8,
    reviews: 0,
    description: '',
    coverClass: 'cover-blue'
  };

  private readonly coverClasses = [
    'cover-blue',
    'cover-purple',
    'cover-orange',
    'cover-yellow',
    'cover-green',
    'cover-teal'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const idParam = params.get('id');

      if (idParam) {

        const id = Number(idParam);

        if (!Number.isInteger(id) || id <= 0) {
          this.errorMessage = 'ID buku tidak valid.';
          return;
        }

        this.bookId = id;
        this.loadBook();

      }

    });

  }

  // CEK STATUS LOGIN
  get loggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCoverImageUrl(url?: string): string {
    if (!url) return '';
    if (/^(https?:|blob:|data:)/i.test(url)) return url;
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  // LOAD DETAIL BUKU DARI API
  loadBook(): void {

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      book: this.bookService.getById(this.bookId),
      inventories: this.inventoryService.getAll(this.bookId).pipe(
        catchError((err) => {
          console.warn('Gagal memuat inventory buku:', err);
          return of([] as InventoryResponse[]);
        })
      )
    }).subscribe({

      next: ({ book: b, inventories }) => {

        this.loading = false;

        let availableCount = b.availableStock ?? b.totalStock ?? 0;
        if (inventories && inventories.length > 0) {
          availableCount = inventories.filter(inv =>
            inv.availabilityStatus === 'AVAILABLE' ||
            inv.statusName === 'AVAILABLE' ||
            inv.availabilityStatus === 0
          ).length;
        }

        this.book = {

          id: Number(b.bookId),

          title: b.title,

          author: b.author?.authorName
            || 'Penulis Tidak Diketahui',

          isbn: b.isbn || '-',

          category: b.category?.categoryName
            || 'Umum',

          publisher: b.publisher?.publisherName
            || '-',

          year: b.createdAt
            ? new Date(b.createdAt).getFullYear()
            : '-',

          stock: availableCount,

          rating: 4.8,

          reviews: 12,

          description: b.description
            || 'Tidak ada deskripsi tersedia untuk buku ini.',

          coverClass: this.coverClasses[
            Math.abs(Number(b.bookId)) % this.coverClasses.length
          ],

          coverUrl: b.coverUrl

        };

      },

      error: (err) => {

        console.error('Gagal memuat buku:', err);

        this.loading = false;

        this.errorMessage =
          'Buku tidak ditemukan atau terjadi kesalahan saat memuat data.';

      }

    });

  }

  // TAMBAH KE FAVORIT
  toggleFavorite(): void {

    if (!this.authService.isLoggedIn()) {

      this.goToLogin();

      return;

    }

    this.isFavorite = !this.isFavorite;

  }

  // PINJAM / RESERVASI BUKU — arahkan ke halaman reservasi
  borrowBook(): void {

    // Periksa status login
    if (!this.authService.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    // Arahkan ke halaman reservasi dengan bookId sebagai query param
    this.router.navigate(['/reservations'], {
      queryParams: { bookId: this.bookId }
    });

  }

  // ARAHKAN USER KE LOGIN
  private goToLogin(): void {

    this.router.navigate(['/login'], {

      queryParams: {
        returnUrl: this.router.url
      }

    });

  }

}
