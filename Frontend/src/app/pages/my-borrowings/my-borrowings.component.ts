import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Borrowing, BorrowingService } from '../../services/borrowing.service';

@Component({
  selector: 'app-my-borrowings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './my-borrowings.component.html',
  styleUrl: './my-borrowings.component.scss',
})
export class MyBorrowingsComponent implements OnInit {
  activeTab: 'active' | 'history' | 'all' = 'active';
  borrowings: Borrowing[] = [];
  isLoading = false;
  errorMessage = '';
  search = '';

  constructor(
    private borrowingService: BorrowingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  goToCatalog(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/catalog']);
  }

  loadData(): void {
    this.isLoading = true;
    this.borrowingService.getMine().subscribe({
      next: (data) => {
        this.borrowings = (data || []).map((b) => this.normalizeBorrowing(b));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err.error?.message || 'Gagal memuat riwayat peminjaman.';
      },
    });
  }

  isOverdue(b: Borrowing): boolean {
    const due = this.parseDateOnly(b.dueDate);
    if (!due) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.hasActiveItems(b) && due < today;
  }

  isAllReturned(b: Borrowing): boolean {
    return b.items.length > 0 && b.items.every((i) => !!i.returnDate);
  }

  hasActiveItems(b: Borrowing): boolean {
    return b.items.some((i) => !i.returnDate);
  }

  getDaysRemaining(dueDate: any): number {
    const due = this.parseDateOnly(dueDate);
    if (!due) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get activeBorrowings(): Borrowing[] {
    return this.borrowings.filter((b) => b.items.some((i) => !i.returnDate));
  }

  get finishedBorrowings(): Borrowing[] {
    return this.borrowings.filter(
      (b) => b.items.length > 0 && b.items.every((i) => !!i.returnDate),
    );
  }

  get filtered(): Borrowing[] {
    let list: Borrowing[] = [];
    if (this.activeTab === 'active') {
      list = this.activeBorrowings;
    } else if (this.activeTab === 'history') {
      list = this.finishedBorrowings;
    } else {
      list = this.borrowings;
    }

    const q = this.search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (b) =>
        String(b.bookBorrowingTransactionId).includes(q) ||
        b.items.some((i) => i.bookTitle.toLowerCase().includes(q)),
    );
  }

  get totalActiveBooks(): number {
    return this.borrowings.reduce((acc, b) => {
      return acc + b.items.filter((i) => !i.returnDate).length;
    }, 0);
  }

  get totalOverdueBooks(): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.borrowings.reduce((acc, b) => {
      const due = this.parseDateOnly(b.dueDate);
      if (due && due < today) {
        return acc + b.items.filter((i) => !i.returnDate).length;
      }
      return acc;
    }, 0);
  }

  get totalFinishedBooks(): number {
    return this.borrowings.reduce((acc, b) => {
      return acc + b.items.filter((i) => !!i.returnDate).length;
    }, 0);
  }

  getConditionLabel(cond: string | null): string {
    switch (cond) {
      case 'GOOD':
        return 'Kondisi Baik';
      case 'DAMAGED_LIGHT':
        return 'Rusak Ringan';
      case 'DAMAGED_HEAVY':
        return 'Rusak Berat';
      case 'LOST':
        return 'Hilang';
      default:
        return cond || 'Kembali';
    }
  }

  getConditionBadge(cond: string | null): string {
    switch (cond) {
      case 'GOOD':
        return 'bg-success-subtle text-success';
      case 'DAMAGED_LIGHT':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'DAMAGED_HEAVY':
        return 'bg-danger-subtle text-danger';
      case 'LOST':
        return 'bg-dark-subtle text-dark';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  private normalizeBorrowing(b: Borrowing): Borrowing {
    return {
      ...b,
      borrowDate: this.formatDateOnly(b.borrowDate),
      dueDate: this.formatDateOnly(b.dueDate),
      items: (b.items || []).map((item) => ({
        ...item,
        returnDate: item.returnDate
          ? this.formatDateOnly(item.returnDate)
          : null,
      })),
    };
  }

  private parseDateOnly(val: any): Date | null {
    if (!val) return null;

    if (typeof val === 'object' && val.year && val.month && val.day) {
      return new Date(Number(val.year), Number(val.month) - 1, Number(val.day));
    }

    if (typeof val === 'string') {
      const clean = val.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        return new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
        );
      }
      const parsed = new Date(val);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }

    return null;
  }

  private formatDateOnly(val: any): string {
    const date = this.parseDateOnly(val);
    if (!date) return '-';

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
