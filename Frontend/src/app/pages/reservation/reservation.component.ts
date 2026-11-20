import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BookReservationService, BookReservationResponse } from '../../services/book-reservation.service';
import { BookService, BookItem } from '../../services/book.service';
import { AuthService, UserSummary } from '../../services/auth.service';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent implements OnInit {

  currentUser: UserSummary | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  alertMessage: { type: 'success' | 'danger'; text: string } | null = null;

  // Form Model
  selectedBookId: number = 5; // Default Dune
  selectedBook: BookItem | null = null;
  reservationDate: string = '';
  notes: string = '';

  // Books list for selection
  availableBooks: BookItem[] = [
    {
      bookId: 5,
      title: 'Dune',
      authorName: 'Frank Herbert',
      categoryName: 'Fiksi Ilmiah',
      coverColor: 'cover-brown',
      stock: 0,
      isBorrowed: true,
      estimatedAvailableDate: '24 Nov 2026'
    },
    {
      bookId: 6,
      title: 'The Pragmatic Programmer',
      authorName: 'Hunt & Thomas',
      categoryName: 'Programming',
      coverColor: 'cover-purple',
      stock: 0,
      isBorrowed: true,
      estimatedAvailableDate: '28 Nov 2026'
    },
    {
      bookId: 1,
      title: 'Clean Code',
      authorName: 'Robert C. Martin',
      categoryName: 'Programming',
      coverColor: 'cover-blue',
      stock: 5,
      isBorrowed: false,
      estimatedAvailableDate: 'Tersedia sekarang'
    },
    {
      bookId: 3,
      title: 'Laskar Pelangi',
      authorName: 'Andrea Hirata',
      categoryName: 'Novel',
      coverColor: 'cover-green',
      stock: 10,
      isBorrowed: false,
      estimatedAvailableDate: 'Tersedia sekarang'
    },
    {
      bookId: 4,
      title: 'Atomic Habits',
      authorName: 'James Clear',
      categoryName: 'Pengembangan Diri',
      coverColor: 'cover-orange',
      stock: 0,
      isBorrowed: true,
      estimatedAvailableDate: '30 Nov 2026'
    }
  ];

  // Reservations Data
  activeReservations: BookReservationResponse[] = [];
  historyReservations: BookReservationResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: BookReservationService,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    // Set default tanggal reservasi = hari ini (format YYYY-MM-DD)
    const today = new Date();
    this.reservationDate = today.toISOString().split('T')[0];

    // Load buku dari backend (jika tersedia)
    this.loadBooksFromApi();

    // Check query params untuk pre-select book
    this.route.queryParams.subscribe(params => {
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
    const found = this.availableBooks.find(b => b.bookId === Number(this.selectedBookId));
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

  loadBooksFromApi(): void {
    this.bookService.getAll().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Merge API books
          const mapped = data.map((b: any) => ({
            bookId: b.bookId,
            title: b.title,
            authorName: b.author?.authorName || b.authorName || 'Penulis',
            categoryName: b.category?.categoryName || 'Umum',
            coverColor: this.getCoverColor(b.bookId),
            coverUrl: b.coverUrl,
            stock: b.availableStock ?? b.stock ?? 0,
            isBorrowed: (b.availableStock ?? b.stock ?? 0) <= 0,
            estimatedAvailableDate: '24 Nov 2026'
          }));
          this.availableBooks = mapped;
          this.updateSelectedBook();
        }
      },
      error: () => {
        // Fallback ke local books
        this.updateSelectedBook();
      }
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
          this.activeReservations = res.filter(r => r.status === 'ACTIVE');
          this.historyReservations = res.filter(r => r.status !== 'ACTIVE');
        } else {
          this.setupDemoReservations();
        }
      },
      error: () => {
        this.loading = false;
        this.setupDemoReservations();
      }
    });
  }

  setupDemoReservations(): void {
    this.activeReservations = [
      {
        bookReservationId: 101,
        userId: this.currentUser?.userId || 1,
        userName: this.currentUser?.userName || 'Andi',
        bookId: 5,
        bookTitle: 'Dune',
        authorName: 'Frank Herbert',
        reservationDate: '2026-11-05T00:00:00Z',
        status: 'ACTIVE',
        queueNumber: 2,
        createdAt: '2026-11-05T08:30:00Z'
      }
    ];

    this.historyReservations = [
      {
        bookReservationId: 98,
        userId: this.currentUser?.userId || 1,
        userName: this.currentUser?.userName || 'Andi',
        bookId: 4,
        bookTitle: 'Atomic Habits',
        authorName: 'James Clear',
        reservationDate: '2026-10-18T00:00:00Z',
        status: 'COMPLETE',
        queueNumber: 1,
        createdAt: '2026-10-18T10:00:00Z'
      },
      {
        bookReservationId: 92,
        userId: this.currentUser?.userId || 1,
        userName: this.currentUser?.userName || 'Andi',
        bookId: 7,
        bookTitle: 'Sapiens',
        authorName: 'Yuval Noah Harari',
        reservationDate: '2026-10-02T00:00:00Z',
        status: 'CANCELLED',
        queueNumber: 1,
        createdAt: '2026-10-02T14:15:00Z'
      }
    ];
  }

  submitReservation(): void {
    if (!this.selectedBook) {
      this.showAlert('danger', 'Silakan pilih buku yang ingin direservasi.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      if (confirm('Anda perlu login untuk melakukan reservasi. Pergi ke halaman login?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    this.submitting = true;
    this.alertMessage = null;

    this.reservationService.create({
      bookId: this.selectedBook.bookId,
      notes: this.notes
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showAlert('success', `Reservasi buku "${this.selectedBook?.title}" berhasil dibuat!`);
        this.notes = '';

        // Masukkan ke daftar reservasi aktif
        const newReservation: BookReservationResponse = {
          ...res,
          bookTitle: res.bookTitle || this.selectedBook?.title || 'Buku',
          authorName: res.authorName || this.selectedBook?.authorName,
          queueNumber: res.queueNumber || (this.activeReservations.length + 1)
        };
        this.activeReservations.unshift(newReservation);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.message || 'Terjadi kesalahan saat memproses reservasi.';
        this.showAlert('danger', msg);
      }
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
          this.showAlert('success', `Reservasi buku "${item.bookTitle}" telah dibatalkan.`);
        },
        error: (err) => {
          // Fallback lokal jika demo
          this.applyLocalCancel(item);
          this.showAlert('success', `Reservasi buku "${item.bookTitle}" telah dibatalkan.`);
        }
      });
    } else {
      this.applyLocalCancel(item);
      this.showAlert('success', `Reservasi buku "${item.bookTitle}" telah dibatalkan.`);
    }
  }

  private applyLocalCancel(item: BookReservationResponse): void {
    this.activeReservations = this.activeReservations.filter(r => r.bookReservationId !== item.bookReservationId);
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
    const colors = ['cover-brown', 'cover-blue', 'cover-teal', 'cover-green', 'cover-orange', 'cover-purple'];
    return colors[id % colors.length];
  }

  getUserInitial(): string {
    return (this.currentUser?.userName?.[0] || 'A').toUpperCase();
  }

  getUserDisplayName(): string {
    return this.currentUser?.userName || 'Andi';
  }
}
