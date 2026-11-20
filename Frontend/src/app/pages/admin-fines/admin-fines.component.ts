import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FineService } from '../../services/fine.service';
import { Fine } from '../../services/borrowing.service';

@Component({
  selector: 'app-admin-fines',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-fines.component.html',
  styleUrl: './admin-fines.component.scss'
})
export class AdminFinesComponent implements OnInit {

  fines: Fine[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  search = '';
  filterStatus = 'ALL';
  filterType = 'ALL';

  // Modal Konfirmasi Pembayaran Kasir
  showPayModal = false;
  selectedFine: Fine | null = null;
  isProcessingPayment = false;

  constructor(private fineService: FineService) {}

  ngOnInit(): void {
    this.loadFines();
  }

  loadFines(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const statusParam = this.filterStatus === 'ALL' ? undefined : this.filterStatus;
    const typeParam = this.filterType === 'ALL' ? undefined : this.filterType;

    this.fineService.getAll(statusParam, typeParam).subscribe({
      next: (data) => {
        this.fines = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Gagal memuat data denda perpustakaan.';
      }
    });
  }

  onFilterChange(): void {
    this.loadFines();
  }

  get filtered(): Fine[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.fines;

    return this.fines.filter(f =>
      (f.username && f.username.toLowerCase().includes(q)) ||
      (f.bookTitle && f.bookTitle.toLowerCase().includes(q)) ||
      String(f.fineId).includes(q) ||
      String(f.userId || '').includes(q)
    );
  }

  get totalUnpaidAmount(): number {
    return this.fines
      .filter(f => f.fineStatus === 'UNPAID' || f.fineStatus === 'Unpaid')
      .reduce((acc, f) => acc + (f.amount || 0), 0);
  }

  get totalUnpaidCount(): number {
    return this.fines.filter(f => f.fineStatus === 'UNPAID' || f.fineStatus === 'Unpaid').length;
  }

  get totalPaidAmount(): number {
    return this.fines
      .filter(f => f.fineStatus === 'PAID' || f.fineStatus === 'Paid')
      .reduce((acc, f) => acc + (f.amount || 0), 0);
  }

  get totalPaidCount(): number {
    return this.fines.filter(f => f.fineStatus === 'PAID' || f.fineStatus === 'Paid').length;
  }

  openPayModal(f: Fine): void {
    this.selectedFine = f;
    this.errorMessage = '';
    this.successMessage = '';
    this.showPayModal = true;
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.selectedFine = null;
  }

  confirmPay(): void {
    if (!this.selectedFine) return;

    this.isProcessingPayment = true;
    this.errorMessage = '';
    this.successMessage = '';

    const fineId = this.selectedFine.fineId;
    this.fineService.pay(fineId).subscribe({
      next: () => {
        this.isProcessingPayment = false;
        this.successMessage = `Denda #${fineId} berhasil ditandai LUNAS!`;
        this.closePayModal();
        this.loadFines();
      },
      error: (err) => {
        this.isProcessingPayment = false;
        this.errorMessage = err.error?.message || 'Gagal memproses pembayaran denda.';
      }
    });
  }

  getFineTypeLabel(type: string): string {
    switch (type) {
      case 'LATE': return 'Keterlambatan';
      case 'DAMAGED': return 'Kerusakan';
      case 'LOST': return 'Kehilangan';
      default: return type || '-';
    }
  }

  getFineTypeBadgeClass(type: string): string {
    switch (type) {
      case 'LATE': return 'bg-warning-subtle text-warning-emphasis';
      case 'DAMAGED': return 'bg-danger-subtle text-danger';
      case 'LOST': return 'bg-dark-subtle text-dark';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}
