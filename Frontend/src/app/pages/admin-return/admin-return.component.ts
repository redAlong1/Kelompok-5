import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import {
  Borrowing,
  BorrowingItem,
  BorrowingService,
  BookCondition,
  Fine,
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
  styleUrl: './admin-return.component.scss',
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
    { value: 'LOST', label: 'Hilang' },
  ];

  // --- BORROW DATA ---
  reservations: any[] = [];
  isLoadingReservations = false;
  rejectingReservationId: number | null = null;
  searchReservation = '';
  users: any[] = [];
  inventories: any[] = [];

  // Modal: Proses Booking
  showProcessModal = false;
  showRejectModal = false;
  selectedRejectReservation: any = null;
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
        this.borrowings = (data || []).map((b) => this.normalizeBorrowing(b));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = this.getError(err);
      },
    });
  }

  get filtered(): Borrowing[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.borrowings;
    return this.borrowings.filter(
      (b) =>
        b.username.toLowerCase().includes(q) ||
        String(b.bookBorrowingTransactionId).includes(q),
    );
  }

  select(b: Borrowing): void {
    this.selected = b;
    this.errorMessage = '';
    this.successMessage = '';
    this.resultFines = [];

    this.rows = b.items
      .filter((i) => !i.returnDate)
      .map((i) => ({
        item: i,
        selected: true,
        condition: 'GOOD' as BookCondition,
      }));
  }

  cancel(): void {
    this.selected = null;
    this.rows = [];
  }

  isOverdue(b: Borrowing | null): boolean {
    if (!b) return false;
    const due = this.parseDateOnly(b.dueDate);
    if (!due) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return due < today;
  }

  get selectedCount(): number {
    return this.rows.filter((r) => r.selected).length;
  }

  submit(): void {
    if (!this.selected || this.selectedCount === 0) return;

    this.isSaving = true;
    this.errorMessage = '';

    const items = this.rows
      .filter((r) => r.selected)
      .map((r) => ({
        borrowingItemId: r.item.borrowingItemId,
        condition: r.condition,
      }));

    this.borrowingService
      .returnBooks(this.selected.bookBorrowingTransactionId, items)
      .subscribe({
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
        },
      });
  }

  // ---------- BORROW & RESERVATION METHODS ----------
  loadBorrowData(): void {
    this.isLoadingReservations = true;
    this.borrowingService.getReservations('ACTIVE').subscribe({
      next: (data) => {
        this.reservations = (data || []).map((r) => ({
          ...r,
          reservationDate: r.reservationDate
            ? this.formatDateOnly(r.reservationDate)
            : r.reservationDate,
        }));
        this.isLoadingReservations = false;
      },
      error: () => {
        this.isLoadingReservations = false;
      },
    });

    this.borrowingService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: () => {},
    });

    this.borrowingService.getInventories().subscribe({
      next: (data) => (this.inventories = data),
      error: () => {},
    });
  }

  getBorrowDaysByUserId(userId?: number | null): number {
    if (!userId && this.selectedReservation) {
      return (
        this.selectedReservation.borrowDays ??
        this.selectedReservation.maxBorrowDays ??
        this.selectedReservation.borrowDurationDays ??
        this.selectedReservation.membershipTier?.borrowDays ??
        this.selectedReservation.membershipTier?.maxBorrowDays ??
        this.selectedReservation.membershipTier?.borrowDurationDays ??
        0
      );
    }

    if (!userId) return 0;

    const user = this.users.find((u) => u.userId === userId);
    if (!user) return 0;

    return (
      user.borrowDays ??
      user.maxBorrowDays ??
      user.borrowDurationDays ??
      user.membershipTier?.borrowDays ??
      user.membershipTier?.maxBorrowDays ??
      user.membershipTier?.borrowDurationDays ??
      0
    );
  }

  get filteredReservations(): any[] {
    const q = this.searchReservation.trim().toLowerCase();
    if (!q) return this.reservations;
    return this.reservations.filter(
      (r) =>
        (r.userName && r.userName.toLowerCase().includes(q)) ||
        (r.bookTitle && r.bookTitle.toLowerCase().includes(q)),
    );
  }

  get availableInventories(): any[] {
    return this.inventories.filter(
      (i) =>
        i.availabilityStatus === 0 ||
        i.availabilityStatus === 'AVAILABLE' ||
        i.statusName === 'AVAILABLE',
    );
  }

  getUnitsForBook(bookId: number): any[] {
    return this.inventories
      .filter((i) => {
        if (Number(i.bookId) !== Number(bookId)) return false;
        const status = this.getInventoryStatus(i);
        return status === 'AVAILABLE' || status === 'RESERVED';
      })
      .sort((a, b) => {
        // Reservasi sudah menahan satu unit; proses unit itu lebih dulu.
        const aReserved = this.getInventoryStatus(a) === 'RESERVED' ? 1 : 0;
        const bReserved = this.getInventoryStatus(b) === 'RESERVED' ? 1 : 0;
        return bReserved - aReserved;
      });
  }

  private getInventoryStatus(inventory: any): string {
    const status = inventory.availabilityStatus ?? inventory.statusName;
    if (typeof status === 'number') {
      return ['AVAILABLE', 'BORROWED', 'RESERVED', 'UNAVAILABLE'][status] ?? '';
    }
    const normalized = String(status ?? '').trim().toUpperCase();
    if (/^[0-3]$/.test(normalized)) {
      return ['AVAILABLE', 'BORROWED', 'RESERVED', 'UNAVAILABLE'][Number(normalized)];
    }
    return normalized;
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

  openRejectConfirmation(res: any): void {
    this.errorMessage = '';
    this.selectedRejectReservation = res;
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    if (this.rejectingReservationId !== null) return;
    this.showRejectModal = false;
    this.selectedRejectReservation = null;
    this.errorMessage = '';
  }

  confirmRejectReservation(): void {
    const res = this.selectedRejectReservation;
    const reservationId = Number(res?.bookReservationId);
    if (!reservationId || this.rejectingReservationId !== null) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.rejectingReservationId = reservationId;

    this.borrowingService.rejectReservation(reservationId).subscribe({
      next: () => {
        this.rejectingReservationId = null;
        this.showRejectModal = false;
        this.selectedRejectReservation = null;
        this.successMessage = `Reservasi "${res.bookTitle}" milik ${res.userName} berhasil ditolak.`;
        this.loadBorrowData();
      },
      error: (err) => {
        this.rejectingReservationId = null;
        this.errorMessage = this.getError(err);
      },
    });
  }

  closeProcessModal(): void {
    this.showProcessModal = false;
    this.selectedReservation = null;
    this.availableUnitsForBook = [];
    this.selectedInventoryId = null;
    this.errorMessage = '';
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
          },
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = this.getError(err);
      },
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
    this.errorMessage = '';
  }

  confirmWalkInBorrow(): void {
    if (!this.walkInUserId || !this.walkInInventoryId) {
      this.errorMessage = 'Pilih member dan unit buku terlebih dahulu.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.borrowingService
      .borrow(this.walkInUserId, [this.walkInInventoryId])
      .subscribe({
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
        },
      });
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

  private getError(err: any): string {
    if (err.status === 0) return 'Tidak dapat terhubung ke server.';
    if (err.status === 401) return 'Sesi habis, silakan login ulang.';
    if (err.status === 403) return 'Anda tidak memiliki akses.';
    return err.error?.message ?? 'Terjadi kesalahan, silakan coba lagi.';
  }
}
