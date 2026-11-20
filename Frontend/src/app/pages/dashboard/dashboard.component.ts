import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';        // SESUAIKAN path
import { BorrowingService, Borrowing } from '../../services/borrowing.service';
import { FineService } from '../../services/fine.service';

interface BorrowedBook {
  id: number;
  title: string;
  dueDate: string;
  daysLeft: number;
  coverColor: string;
  coverLabel: string;
}

interface Activity {
  type: 'borrow' | 'return' | 'reserve' | 'fine';
  description: string;
  date: string;
  sortKey: number;
  isLate?: boolean;
}

interface ReservedBook {
  title: string;
  author: string;
  queue: number;
  coverColor: string;
  coverLabel: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],   // SidebarComponent dihapus: sidebar sudah ada di layout
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  userName = '';

  isLoading = false;
  errorMessage = '';

  stats = {
    borrowed: 0,
    reserved: 0,
    fine: 0,
    membership: ''
  };

  // Samakan dengan Borrowing:MaxItems di appsettings.json backend
  borrowLimit = { max: 3, current: 0 };

  dueSoonCount = 0;

  borrowedBooks: BorrowedBook[] = [];
  activities: Activity[] = [];

  // Belum ada endpoint reservasi, jadi dikosongkan dulu
  reservedBook: ReservedBook | null = null;

  private readonly covers = ['cover-blue', 'cover-green', 'cover-brown'];

  constructor(
    private authService: AuthService,
    private borrowingService: BorrowingService,
    private fineService: FineService
  ) {
    const user = this.authService.getUser();
    this.userName = user?.userName ?? '';
    this.stats.membership = user?.membershipTierName ?? '-';
  }

  ngOnInit(): void {
    this.authService.refreshUser().subscribe(u => {
      this.stats.membership = u.membershipTierName;
      this.borrowLimit.max = u.maxBorrowItems;
    });
    this.loadBorrowings();
    this.loadFines();
  }

  get borrowPercent(): number {
    return Math.min(100, (this.borrowLimit.current / this.borrowLimit.max) * 100);
  }

  get remainingBorrow(): number {
    return Math.max(0, this.borrowLimit.max - this.borrowLimit.current);
  }

  // ---------- Data ----------
  private loadBorrowings(): void {
    this.isLoading = true;
    this.borrowingService.getMine().subscribe({
      next: (data) => {
        this.buildBorrowedBooks(data);
        this.buildActivities(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getError(err);
      }
    });
  }

  private loadFines(): void {
    this.fineService.getMine().subscribe({
      next: (fines) => {
        this.stats.fine = fines
          .filter(f => f.fineStatus === 'UNPAID')
          .reduce((sum, f) => sum + f.amount, 0);
      },
      error: (err) => (this.errorMessage = this.getError(err))
    });
  }

  private buildBorrowedBooks(data: Borrowing[]): void {
    const books: BorrowedBook[] = [];

    for (const t of data) {
      for (const i of t.items) {
        if (i.returnDate) continue;                 // sudah dikembalikan
        books.push({
          id: i.borrowingItemId,
          title: i.bookTitle,
          dueDate: this.formatDate(t.dueDate),
          daysLeft: this.daysUntil(t.dueDate),
          coverColor: this.covers[books.length % this.covers.length],
          coverLabel: i.bookTitle
        });
      }
    }

    books.sort((a, b) => a.daysLeft - b.daysLeft);
    this.borrowedBooks = books;
    this.stats.borrowed = books.length;
    this.borrowLimit.current = books.length;
    this.dueSoonCount = books.filter(b => b.daysLeft <= 7).length;
  }

  private buildActivities(data: Borrowing[]): void {
    const list: Activity[] = [];

    for (const t of data) {
      const borrowTime = new Date(t.borrowDate).getTime();
      for (const i of t.items) {
        list.push({
          type: 'borrow',
          description: `Meminjam buku ${i.bookTitle}`,
          date: this.formatDate(t.borrowDate),
          sortKey: borrowTime
        });

        if (i.returnDate) {
          const late = (i.lateDays ?? 0) > 0;
          list.push({
            type: 'return',
            description: `Mengembalikan ${i.bookTitle}` + (late ? ` (terlambat ${i.lateDays} hari)` : ''),
            date: this.formatDate(i.returnDate),
            sortKey: new Date(i.returnDate).getTime(),
            isLate: late
          });
        }
      }
    }

    this.activities = list.sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  }

  // ---------- Helper tampilan ----------
  getActivityIcon(type: string, isLate?: boolean): string {
    if (type === 'return' && isLate) return 'bi-check-circle-fill text-danger';
    if (type === 'borrow') return 'bi-bookmark text-primary';
    if (type === 'return') return 'bi-check-circle text-success';
    if (type === 'reserve') return 'bi-bookmark text-primary';
    return 'bi-info-circle text-muted';
  }

  getDaysLeftClass(days: number): string {
    if (days <= 2) return 'badge-days-urgent';
    if (days <= 5) return 'badge-days-warning';
    return 'badge-days-ok';
  }

  getDaysLeftText(days: number): string {
    return days >= 0 ? `${days} hari lagi` : `Terlambat ${Math.abs(days)} hari`;
  }

  private daysUntil(dateStr: string): number {
    const due = new Date(dateStr.substring(0, 10) + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((due.getTime() - today.getTime()) / 86400000);
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  private getError(err: any): string {
    if (err.status === 0) return 'Tidak dapat terhubung ke server.';
    if (err.status === 401) return 'Sesi habis, silakan login ulang.';
    return err.error?.message ?? 'Gagal memuat data dashboard.';
  }
}