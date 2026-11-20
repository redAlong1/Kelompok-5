import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import {
  Borrowing,
  BorrowingItem,
  BorrowingService,
  BookCondition,
  Fine
} from '../../services/borrowing.service';

interface ReturnRow {
  item: BorrowingItem;
  selected: boolean;
  condition: BookCondition;
}

@Component({
  selector: 'app-admin-return',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-return.component.html',
  styleUrl: './admin-return.component.scss'
})
export class AdminReturnComponent implements OnInit {

  activeTab: 'borrow' | 'return' = 'borrow';

  // --- RETURN DATA ---
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

  // --- BORROW DATA ---
  reservations: any[] = [];
  isLoadingReservations = false;
  searchReservation = '';
  users: any[] = [];
  inventories: any[] = [];

  // Modal: Proses Booking
  showProcessModal = false;
  selectedReservation: any = null;
  availableUnitsForBook: any[] = [];
  selectedInventoryId: number | null = null;

  // Modal: Walk-in Borrow
  showWalkInModal = false;
  walkInUserId: number | null = null;
  walkInInventoryId: number | null = null;

  constructor(private borrowingService: BorrowingService) {}

  ngOnInit(): void {
    this.loadBorrowings();
    this.loadBorrowData();
  }

  setTab(tab: 'borrow' | 'return'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    if (tab === 'borrow') {
      this.loadBorrowData();
    } else {
      this.loadBorrowings();
    }
  }

  // ---------- RETURN METHODS ----------
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
        this.loadBorrowData();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = this.getError(err);
      }
    });
  }

  // ---------- BORROW & RESERVATION METHODS ----------
  loadBorrowData(): void {
    this.isLoadingReservations = true;
    this.borrowingService.getReservations('ACTIVE').subscribe({
      next: (data) => {
        this.reservations = data;
        this.isLoadingReservations = false;
      },
      error: () => {
        this.isLoadingReservations = false;
      }
    });

    this.borrowingService.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => {}
    });

    this.borrowingService.getInventories().subscribe({
      next: (data) => this.inventories = data,
      error: () => {}
    });
  }

  get filteredReservations(): any[] {
    const q = this.searchReservation.trim().toLowerCase();
    if (!q) return this.reservations;
    return this.reservations.filter(r =>
      (r.userName && r.userName.toLowerCase().includes(q)) ||
      (r.bookTitle && r.bookTitle.toLowerCase().includes(q))
    );
  }

  get availableInventories(): any[] {
    return this.inventories.filter(i =>
      i.availabilityStatus === 0 ||
      i.availabilityStatus === 'AVAILABLE' ||
      i.statusName === 'AVAILABLE'
    );
  }

  getUnitsForBook(bookId: number): any[] {
    return this.availableInventories.filter(i => i.bookId === bookId);
  }

  openProcessReservation(res: any): void {
    this.errorMessage = '';
    this.successMessage = '';
    const units = this.getUnitsForBook(res.bookId);

    if (units.length === 0) {
      this.errorMessage = `Semua unit eksemplar buku "${res.bookTitle}" saat ini masih berstatus dipinjam. Tunggu buku dikembalikan ke perpustakaan.`;
      return;
    }

    this.selectedReservation = res;
    this.availableUnitsForBook = units;
    this.selectedInventoryId = units[0].inventoryId;
    this.showProcessModal = true;
  }

  closeProcessModal(): void {
    this.showProcessModal = false;
    this.selectedReservation = null;
    this.availableUnitsForBook = [];
    this.selectedInventoryId = null;
  }

  confirmBorrowReservation(): void {
    if (!this.selectedReservation || !this.selectedInventoryId) return;

    this.isSaving = true;
    this.errorMessage = '';

    const userId = this.selectedReservation.userId;
    const invId = this.selectedInventoryId;
    const resId = this.selectedReservation.bookReservationId;

    this.borrowingService.borrow(userId, [invId]).subscribe({
      next: () => {
        this.borrowingService.completeReservation(resId).subscribe({
          next: () => {
            this.isSaving = false;
            this.successMessage = `Peminjaman buku "${this.selectedReservation?.bookTitle}" untuk ${this.selectedReservation?.userName} berhasil dicatat!`;
            this.closeProcessModal();
            this.loadBorrowData();
            this.loadBorrowings();
          },
          error: () => {
            this.isSaving = false;
            this.successMessage = `Peminjaman berhasil dicatat!`;
            this.closeProcessModal();
            this.loadBorrowData();
            this.loadBorrowings();
          }
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = this.getError(err);
      }
    });
  }

  openWalkInModal(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.walkInUserId = null;
    this.walkInInventoryId = null;
    this.showWalkInModal = true;
  }

  closeWalkInModal(): void {
    this.showWalkInModal = false;
    this.walkInUserId = null;
    this.walkInInventoryId = null;
  }

  confirmWalkInBorrow(): void {
    if (!this.walkInUserId || !this.walkInInventoryId) {
      this.errorMessage = 'Pilih member dan unit buku terlebih dahulu.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.borrowingService.borrow(this.walkInUserId, [this.walkInInventoryId]).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Peminjaman walk-in berhasil dicatat!';
        this.closeWalkInModal();
        this.loadBorrowData();
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
