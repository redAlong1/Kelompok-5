import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import {
  BookReservationService,
  BookReservationResponse,
} from '../../services/book-reservation.service';
import { BookService, BookItem } from '../../services/book.service';
import {
  InventoryService,
  InventoryResponse,
} from '../../services/inventory.service';
import { AuthService, UserSummary } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
})
export class ReservationComponent implements OnInit {
  currentUser: UserSummary | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  alertMessage: { type: 'success' | 'danger'; text: string } | null = null;

  // Form Model
  selectedBookId: number = 0;
  selectedBook: BookItem | null = null;
  reservationDate: string = '';
  notes: string = '';

  // Books list for selection (akan diisi dari API)
  availableBooks: BookItem[] = [];

  // Reservations Data
  activeReservations: BookReservationResponse[] = [];
  historyReservations: BookReservationResponse[] = [];

  // Helper untuk cek apakah buku yang dipilih sudah aktif direservasi user
  get isSelectedBookAlreadyReserved(): boolean {
    if (!this.selectedBook) return false;
    return this.activeReservations.some(
      (r) => Number(r.bookId) === Number(this.selectedBook?.bookId)
    );
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: BookReservationService,
    private bookService: BookService,
    private inventoryService: InventoryService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    // Set default tanggal reservasi = hari ini (format YYYY-MM-DD)
    const today = new Date();
    this.reservationDate = today.toISOString().split('T')[0];

    // Load buku dari backend (jika tersedia)
    this.loadBooksFromApi();

    // Check query params untuk pre-select book
    this.route.queryParams.subscribe((params) => {
      if (params['bookId']) {
        const id = Number(params['bookId']);
        if (!isNaN(id)) {
          this.selectedBookId = id;
        }
      }
      this.updateSelectedBook();
    });

    // Load data reservasi user
    this.loadReservations();
  }

  updateSelectedBook(): void {
    const found = this.availableBooks.find(
      (b) => b.bookId === Number(this.selectedBookId),
    );
    if (found) {
      this.selectedBook = found;
    } else if (this.availableBooks.length > 0) {
      this.selectedBook = this.availableBooks[0];
      this.selectedBookId = this.selectedBook.bookId;
    }
  }

  onBookChange(): void {
    this.updateSelectedBook();
  }

  getCoverImageUrl(url?: string): string {
    if (!url) return '';
    if (/^(https?:|blob:|data:)/i.test(url)) return url;
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  loadBooksFromApi(): void {
    forkJoin({
      books: this.bookService.getAll(),
      inventories: this.inventoryService.getAll().pipe(
        catchError((err) => {
          console.warn('Gagal memuat inventory, fallback ke data buku:', err);
          return of([] as InventoryResponse[]);
        }),
      ),
    }).subscribe({
      next: ({ books, inventories }) => {
        if (books && books.length > 0) {
          // Buat map stok tersedia dari API inventory berdasarkan bookId
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

          const mapped = books.map((b: any) => {
            const bId = Number(b.bookId);
            let availableCount = b.availableStock ?? b.stock ?? 0;

            if (hasInventoryData) {
              availableCount = stockMap.get(bId) || 0;
            }

            return {
              bookId: bId,
              title: b.title,
              authorName: b.author?.authorName || b.authorName || 'Penulis',
              categoryName: b.category?.categoryName || 'Umum',
              coverColor: this.getCoverColor(bId),
              coverUrl: b.coverUrl,
              stock: availableCount,
              isBorrowed: availableCount <= 0,
              estimatedAvailableDate: '24 Nov 2026',
            };
          });

          this.availableBooks = mapped;
          this.updateSelectedBook();
        }
      },
      error: () => {
        // Fallback ke local books
        this.updateSelectedBook();
      },
    });
  }

  loadReservations(): void {
    if (!this.authService.isLoggedIn()) {
      // Data demo jika belum login
      this.setupDemoReservations();
      return;
    }

    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.length > 0) {
          this.activeReservations = res.filter((r) => r.status === 'ACTIVE');
          this.historyReservations = res.filter((r) => r.status !== 'ACTIVE');
        } else {
          this.setupDemoReservations();
        }
      },
      error: () => {
        this.loading = false;
        this.setupDemoReservations();
      },
    });
  }

  setupDemoReservations(): void {
    // Tidak ada data dummy – biarkan kosong
    this.activeReservations = [];
    this.historyReservations = [];
  }

  submitReservation(): void {
    if (!this.selectedBook) {
      this.showAlert('danger', 'Silakan pilih buku yang ingin direservasi.');
      return;
    }

    if (this.isSelectedBookAlreadyReserved) {
      this.showAlert(
        'danger',
        `Anda sudah memiliki reservasi aktif untuk buku "${this.selectedBook.title}".`
      );
      return;
    }

    if (!this.authService.isLoggedIn()) {
      if (
        confirm(
          'Anda perlu login untuk melakukan reservasi. Pergi ke halaman login?',
        )
      ) {
        this.router.navigate(['/login']);
      }
      return;
    }

    this.submitting = true;
    this.alertMessage = null;

    this.reservationService
      .create({
        bookId: this.selectedBook.bookId,
        notes: this.notes,
      })
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.showAlert(
            'success',
            `Reservasi buku "${this.selectedBook?.title}" berhasil dibuat!`,
          );
          this.notes = '';

          // Masukkan ke daftar reservasi aktif
          const newReservation: BookReservationResponse = {
            ...res,
            bookTitle: res.bookTitle || this.selectedBook?.title || 'Buku',
            authorName: res.authorName || this.selectedBook?.authorName,
            queueNumber: res.queueNumber || this.activeReservations.length + 1,
          };
          this.activeReservations.unshift(newReservation);
        },
        error: (err) => {
          this.submitting = false;
          const msg =
            err.error?.message || 'Terjadi kesalahan saat memproses reservasi.';
          this.showAlert('danger', msg);
        },
      });
  }

  cancelReservation(item: BookReservationResponse): void {
    if (!confirm(`Batalkan reservasi untuk buku "${item.bookTitle}"?`)) {
      return;
    }

    if (this.authService.isLoggedIn()) {
      this.reservationService.cancel(item.bookReservationId).subscribe({
        next: () => {
          this.applyLocalCancel(item);
          this.showAlert(
            'success',
            `Reservasi buku "${item.bookTitle}" telah dibatalkan.`,
          );
        },
        error: (err) => {
          // Fallback lokal jika demo
          this.applyLocalCancel(item);
          this.showAlert(
            'success',
            `Reservasi buku "${item.bookTitle}" telah dibatalkan.`,
          );
        },
      });
    } else {
      this.applyLocalCancel(item);
      this.showAlert(
        'success',
        `Reservasi buku "${item.bookTitle}" telah dibatalkan.`,
      );
    }
  }

  private applyLocalCancel(item: BookReservationResponse): void {
    this.activeReservations = this.activeReservations.filter(
      (r) => r.bookReservationId !== item.bookReservationId,
    );
    item.status = 'CANCELLED';
    this.historyReservations.unshift(item);
  }

  showAlert(type: 'success' | 'danger', text: string): void {
    this.alertMessage = { type, text };
    setTimeout(() => {
      this.alertMessage = null;
    }, 60000);
  }

  getCoverColor(id: number): string {
    const colors = [
      'cover-brown',
      'cover-blue',
      'cover-teal',
      'cover-green',
      'cover-orange',
      'cover-purple',
    ];
    return colors[id % colors.length];
  }

  getUserInitial(): string {
    return (this.currentUser?.userName?.[0] || 'A').toUpperCase();
  }

  getUserDisplayName(): string {
    return this.currentUser?.userName || 'Andi';
  }
}
