import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  BookService,
  BookResponse,
  CatalogBook,
  CategoryResponse
} from '../../services/book.service';

import {
  InventoryService,
  InventoryResponse
} from '../../services/inventory.service';

import {
  AuthService,
  UserSummary
} from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {

  searchQuery: string = '';
  selectedSort: string = 'newest';

  activeCategory: string = 'Semua';
  activeCategoryId: number = 0;

  loading: boolean = false;
  currentUser: UserSummary | null = null;
  errorMessage: string = '';


  categories: { id: number; name: string }[] = [
    { id: 0, name: 'Semua' }
  ];

  allBooks: CatalogBook[] = [];

  constructor(
    private router: Router,
    private bookService: BookService,
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    this.loadCategories();
    this.loadBooks();
  }


  loadCategories(): void {

    this.bookService.getCategories().subscribe({

      next: (data: CategoryResponse[]) => {

        this.categories = [
          { id: 0, name: 'Semua' },
          ...data.map(c => ({
            id: Number(c.categoryId),
            name: c.categoryName
          }))
        ];

      },

      error: (err) => {

        console.error('Gagal memuat kategori:', err);

        this.categories = [
          { id: 0, name: 'Semua' }
        ];

      }

    });

  }


  loadBooks(): void {

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      books: this.bookService.getAll({
        limit: 100,
        search: this.searchQuery.trim() || undefined,
        category_id: this.activeCategoryId > 0
          ? this.activeCategoryId
          : undefined
      }),
      inventories: this.inventoryService.getAll().pipe(
        catchError((err) => {
          console.warn('Gagal memuat inventory, fallback ke stok buku:', err);
          return of([] as InventoryResponse[]);
        })
      )
    }).subscribe({

      next: ({ books, inventories }) => {

        // Hitung stok tersedia per bookId dari response API inventory
        const stockMap = new Map<number, number>();
        const hasInventoryData = inventories && inventories.length > 0;

        for (const inv of inventories) {
          const bId = Number(inv.bookId);
          const isAvailable =
            inv.availabilityStatus === 'AVAILABLE' ||
            inv.statusName === 'AVAILABLE' ||
            inv.availabilityStatus === 0;

          if (isAvailable) {
            stockMap.set(bId, (stockMap.get(bId) || 0) + 1);
          }
        }

        this.allBooks = books.map((book, index) => {
          const catalogBook = this.mapToCatalogBook(book, index);
          const bId = Number(book.bookId);

          if (hasInventoryData) {
            const availableCount = stockMap.get(bId) || 0;
            catalogBook.stock = availableCount;
            catalogBook.isBorrowed = availableCount <= 0;
          }

          return catalogBook;
        });

        this.loading = false;

        console.log('Data buku & stok dari API inventory:', this.allBooks);

      },

      error: (err) => {

        console.error('Gagal memuat buku:', err);

        this.allBooks = [];
        this.errorMessage = 'Gagal memuat data buku. Silakan coba lagi.';

        this.loading = false;

      }

    });

  }

  mapToCatalogBook(
    b: BookResponse,
    idx: number
  ): CatalogBook {

    const available = b.availableStock ?? 0;

    return {

      bookId: Number(b.bookId),

      title: b.title,

      authorName:
        b.author?.authorName || 'Penulis Tidak Diketahui',

      categoryName:
        b.category?.categoryName || 'Umum',

      categoryId: b.categoryId
        ? Number(b.categoryId)
        : undefined,

      coverColor: this.getCoverColor(
        Number(b.bookId) || idx
      ),

      coverUrl: b.coverUrl,

      rating: 0,

      stock: available,

      isBorrowed: available <= 0,

      isbn: b.isbn,

      description: b.description

    };

  }

  // ==============================
  // FILTER, SEARCH, SORTING
  // ==============================

  get books(): CatalogBook[] {

    let list = [...this.allBooks];

    // Filter kategori
    if (this.activeCategory !== 'Semua') {

      list = list.filter(
        b =>
          (b.categoryName || '').toLowerCase() ===
          this.activeCategory.toLowerCase()
      );

    }

    // Search judul, penulis, ISBN
    if (this.searchQuery.trim()) {

      const q = this.searchQuery.toLowerCase();

      list = list.filter(b =>

        b.title.toLowerCase().includes(q) ||

        b.authorName.toLowerCase().includes(q) ||

        (b.isbn || '').toLowerCase().includes(q)

      );

    }

    // Sorting
    switch (this.selectedSort) {

      case 'newest':

        list.sort((a, b) => b.bookId - a.bookId);

        break;

      case 'rating':

        list.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
        );

        break;

      case 'title':

        list.sort(
          (a, b) => a.title.localeCompare(b.title)
        );

        break;

      case 'popular':
      default:

        list.sort(
          (a, b) => b.bookId - a.bookId
        );

        break;

    }

    return list;

  }


  setCategory(
    cat: { id: number; name: string }
  ): void {

    this.activeCategory = cat.name;

    this.activeCategoryId = cat.id;

    this.loadBooks();

  }


  onSearch(): void {

    this.loadBooks();

  }


  goToDetail(bookId: number): void {

    this.router.navigate(['/books', bookId]);

  }

  pinjamBuku(
    event: Event,
    book: CatalogBook
  ): void {

    event.stopPropagation();

    if (book.stock > 0) {
      // Stok tersedia → arahkan ke halaman reservasi untuk proses peminjaman
      this.router.navigate(
        ['/reservations'],
        {
          queryParams: {
            bookId: book.bookId
          }
        }
      );
    } else {
      // Stok habis (dipinjam semua) → tidak bisa dipinjam/direservasi
      this.errorMessage = `Buku "${book.title}" sedang dipinjam semua. Tidak dapat diproses saat ini.`;
      setTimeout(() => { this.errorMessage = ''; }, 4000);
    }

  }


  getCoverColor(id: number): string {

    const colors = [

      'cover-blue',
      'cover-teal',
      'cover-green',
      'cover-orange',
      'cover-brown',
      'cover-purple',
      'cover-dark',
      'cover-pink'

    ];

    return colors[
      Math.abs(id) % colors.length
    ];

  }

  getCoverImageUrl(url?: string): string {
    if (!url) return '';
    if (/^(https?:|blob:|data:)/i.test(url)) return url;
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }


  getUserInitial(): string {

    return (
      this.currentUser?.userName?.[0] || 'A'
    ).toUpperCase();

  }

  getUserDisplayName(): string {

    return this.currentUser?.userName || 'Andi';

  }

}
