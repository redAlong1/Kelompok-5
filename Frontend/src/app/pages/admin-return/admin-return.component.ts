import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Borrowing,
  BorrowingItem,
  BorrowingService,
  BookCondition,
  Fine
} from '../../services/borrowing.service'; // SESUAIKAN path

interface ReturnRow {
  item: BorrowingItem;
  selected: boolean;
  condition: BookCondition;
}

@Component({
  selector: 'app-admin-return',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-return.component.html',
  styleUrl: './admin-return.component.scss'
})
export class AdminReturnComponent implements OnInit {

  borrowings: Borrowing[] = [];
  selected: Borrowing | null = null;
  rows: ReturnRow[] = [];

  search = '';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  resultFines: Fine[] = [];

  readonly conditions: { value: BookCondition; label: string }[] = [
    { value: 'GOOD', label: 'Baik' },
    { value: 'DAMAGED_LIGHT', label: 'Rusak ringan' },
    { value: 'DAMAGED_HEAVY', label: 'Rusak berat' },
    { value: 'LOST', label: 'Hilang' }
  ];

  constructor(private borrowingService: BorrowingService) {}

  ngOnInit(): void {
    this.loadBorrowings();
  }

  loadBorrowings(): void {
    this.isLoading = true;
    this.borrowingService.getAll('BORROWED').subscribe({
      next: (data) => {
        this.borrowings = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getError(err);
      }
    });
  }

  get filtered(): Borrowing[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.borrowings;
    return this.borrowings.filter(b =>
      b.username.toLowerCase().includes(q) ||
      String(b.bookBorrowingTransactionId).includes(q)
    );
  }

  select(b: Borrowing): void {
    this.selected = b;
    this.errorMessage = '';
    this.successMessage = '';
    this.resultFines = [];

    // hanya buku yang belum dikembalikan
    this.rows = b.items
      .filter(i => !i.returnDate)
      .map(i => ({ item: i, selected: true, condition: 'GOOD' as BookCondition }));
  }

  cancel(): void {
    this.selected = null;
    this.rows = [];
  }

  isOverdue(b: Borrowing): boolean {
    const today = new Date().toISOString().substring(0, 10);
    return b.dueDate < today;
  }

  get selectedCount(): number {
    return this.rows.filter(r => r.selected).length;
  }

  submit(): void {
    if (!this.selected || this.selectedCount === 0) return;

    this.isSaving = true;
    this.errorMessage = '';

    const items = this.rows
      .filter(r => r.selected)
      .map(r => ({ borrowingItemId: r.item.borrowingItemId, condition: r.condition }));

    this.borrowingService.returnBooks(this.selected.bookBorrowingTransactionId, items).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.resultFines = res.fines;
        this.successMessage = 'Pengembalian berhasil disimpan.';
        this.selected = null;
        this.rows = [];
        this.loadBorrowings();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = this.getError(err);
      }
    });
  }

  private getError(err: any): string {
    if (err.status === 0) return 'Tidak dapat terhubung ke server.';
    if (err.status === 401) return 'Sesi habis, silakan login ulang.';
    if (err.status === 403) return 'Anda tidak memiliki akses.';
    return err.error?.message ?? 'Terjadi kesalahan, silakan coba lagi.';
  }
}