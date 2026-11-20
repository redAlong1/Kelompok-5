import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Borrowing, BorrowingService } from '../../services/borrowing.service';

@Component({
  selector: 'app-admin-borrowings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SidebarComponent],
  templateUrl: './admin-borrowings.component.html',
  styleUrl: './admin-borrowings.component.scss'
})
export class AdminBorrowingsComponent implements OnInit {

  borrowings: Borrowing[] = [];
  isLoading = false;
  errorMessage = '';

  search = '';
  filterStatus = 'ALL';

  // Modal Detail Transaksi
  showDetailModal = false;
  selectedBorrowing: Borrowing | null = null;

  constructor(private borrowingService: BorrowingService) {}

  ngOnInit(): void {
    this.loadBorrowings();
  }

  loadBorrowings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const statusParam = this.filterStatus === 'ALL' ? undefined : this.filterStatus;

    this.borrowingService.getAll(statusParam).subscribe({
      next: (data) => {
        this.borrowings = (data || []).map(b => this.normalizeBorrowing(b));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Gagal memuat riwayat transaksi peminjaman.';
      }
    });
  }

  onFilterChange(): void {
    this.loadBorrowings();
  }

  get filtered(): Borrowing[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.borrowings;

    return this.borrowings.filter(b =>
      b.username.toLowerCase().includes(q) ||
      String(b.bookBorrowingTransactionId).includes(q) ||
      String(b.userId).includes(q) ||
      b.items.some(i => i.bookTitle.toLowerCase().includes(q))
    );
  }

  isOverdue(b: Borrowing): boolean {
    const due = this.parseDateOnly(b.dueDate);
    if (!due) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.hasActiveItems(b) && due < today;
  }

  isAllReturned(b: Borrowing): boolean {
    return b.items.length > 0 && b.items.every(i => !!i.returnDate);
  }

  hasActiveItems(b: Borrowing): boolean {
    return b.items.some(i => !i.returnDate);
  }

  get totalActiveCount(): number {
    return this.borrowings.filter(b => b.items.some(i => !i.returnDate)).length;
  }

  get totalFinishedCount(): number {
    return this.borrowings.filter(b => b.items.length > 0 && b.items.every(i => !!i.returnDate)).length;
  }

  openDetailModal(b: Borrowing): void {
    this.selectedBorrowing = b;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBorrowing = null;
  }

  getConditionLabel(cond: string | null): string {
    switch (cond) {
      case 'GOOD': return 'Kondisi Baik';
      case 'DAMAGED_LIGHT': return 'Rusak Ringan';
      case 'DAMAGED_HEAVY': return 'Rusak Berat';
      case 'LOST': return 'Hilang';
      default: return cond || 'Kembali';
    }
  }

  getConditionBadge(cond: string | null): string {
    switch (cond) {
      case 'GOOD': return 'bg-success-subtle text-success';
      case 'DAMAGED_LIGHT': return 'bg-warning-subtle text-warning-emphasis';
      case 'DAMAGED_HEAVY': return 'bg-danger-subtle text-danger';
      case 'LOST': return 'bg-dark-subtle text-dark';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  private normalizeBorrowing(b: Borrowing): Borrowing {
    return {
      ...b,
      borrowDate: this.formatDateOnly(b.borrowDate),
      dueDate: this.formatDateOnly(b.dueDate),
      items: (b.items || []).map(item => ({
        ...item,
        returnDate: item.returnDate ? this.formatDateOnly(item.returnDate) : null
      }))
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
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
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