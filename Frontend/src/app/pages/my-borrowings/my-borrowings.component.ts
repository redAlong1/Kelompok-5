import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { Borrowing, BorrowingService } from '../../services/borrowing.service';

@Component({
  selector: 'app-my-borrowings',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './my-borrowings.component.html',
  styleUrl: './my-borrowings.component.scss'
})
export class MyBorrowingsComponent implements OnInit {

  activeTab: 'active' | 'history' | 'all' = 'active';
  borrowings: Borrowing[] = [];
  isLoading = false;
  errorMessage = '';
  search = '';

  constructor(private borrowingService: BorrowingService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.borrowingService.getMine().subscribe({
      next: (data) => {
        this.borrowings = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Gagal memuat riwayat peminjaman.';
      }
    });
  }

  isOverdue(b: Borrowing): boolean {
    const today = new Date().toISOString().substring(0, 10);
    return this.hasActiveItems(b) && b.dueDate < today;
  }

  isAllReturned(b: Borrowing): boolean {
    return b.items.length > 0 && b.items.every(i => !!i.returnDate);
  }

  hasActiveItems(b: Borrowing): boolean {
    return b.items.some(i => !i.returnDate);
  }

  getDaysRemaining(dueDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get activeBorrowings(): Borrowing[] {
    return this.borrowings.filter(b => b.items.some(i => !i.returnDate));
  }

  get finishedBorrowings(): Borrowing[] {
    return this.borrowings.filter(b => b.items.length > 0 && b.items.every(i => !!i.returnDate));
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

    return list.filter(b =>
      String(b.bookBorrowingTransactionId).includes(q) ||
      b.items.some(i => i.bookTitle.toLowerCase().includes(q))
    );
  }

  get totalActiveBooks(): number {
    return this.borrowings.reduce((acc, b) => {
      return acc + b.items.filter(i => !i.returnDate).length;
    }, 0);
  }

  get totalOverdueBooks(): number {
    const today = new Date().toISOString().substring(0, 10);
    return this.borrowings.reduce((acc, b) => {
      if (b.dueDate < today) {
        return acc + b.items.filter(i => !i.returnDate).length;
      }
      return acc;
    }, 0);
  }

  get totalFinishedBooks(): number {
    return this.borrowings.reduce((acc, b) => {
      return acc + b.items.filter(i => !!i.returnDate).length;
    }, 0);
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
}
