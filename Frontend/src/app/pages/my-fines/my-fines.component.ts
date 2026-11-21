import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { FineService, AccruingFine } from '../../services/fine.service';
import { Fine } from '../../services/borrowing.service';

@Component({
  selector: 'app-my-fines',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './my-fines.component.html',
  styleUrl: './my-fines.component.scss',
})
export class MyFinesComponent implements OnInit {
  activeTab: 'official' | 'accruing' = 'official';

  fines: Fine[] = [];
  accruingFines: AccruingFine[] = [];

  isLoadingFines = false;
  isLoadingAccruing = false;
  errorMessage = '';

  constructor(private fineService: FineService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadFines();
    this.loadAccruing();
  }

  loadFines(): void {
    this.isLoadingFines = true;
    this.fineService.getMine().subscribe({
      next: (data) => {
        this.fines = (data || []).map((f) => this.normalizeFine(f));
        this.isLoadingFines = false;
      },
      error: (err) => {
        this.isLoadingFines = false;
        this.errorMessage = err.error?.message || 'Gagal memuat daftar denda.';
      },
    });
  }

  loadAccruing(): void {
    this.isLoadingAccruing = true;
    this.fineService.getAccruing().subscribe({
      next: (data) => {
        this.accruingFines = (data || []).map((f) =>
          this.normalizeAccruingFine(f),
        );
        this.isLoadingAccruing = false;
      },
      error: () => {
        this.isLoadingAccruing = false;
      },
    });
  }

  get totalUnpaid(): number {
    return this.fines
      .filter((f) => f.fineStatus === 'UNPAID' || f.fineStatus === 'Unpaid')
      .reduce((acc, f) => acc + (f.amount || 0), 0);
  }

  get totalPaid(): number {
    return this.fines
      .filter((f) => f.fineStatus === 'PAID' || f.fineStatus === 'Paid')
      .reduce((acc, f) => acc + (f.amount || 0), 0);
  }

  get totalAccruing(): number {
    return this.accruingFines.reduce(
      (acc, f) => acc + (f.estimatedAmount || 0),
      0,
    );
  }

  get hasUnpaid(): boolean {
    return this.totalUnpaid > 0;
  }

  getFineTypeLabel(type: string): string {
    switch (type) {
      case 'LATE':
        return 'Keterlambatan';
      case 'DAMAGED':
        return 'Kerusakan';
      case 'LOST':
        return 'Kehilangan';
      default:
        return type || '-';
    }
  }

  getFineTypeBadgeClass(type: string): string {
    switch (type) {
      case 'LATE':
        return 'bg-warning-subtle text-warning-emphasis';
      case 'DAMAGED':
        return 'bg-danger-subtle text-danger';
      case 'LOST':
        return 'bg-dark-subtle text-dark';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  private normalizeFine(f: any): Fine {
    return {
      ...f,
      paidDate: f.paidDate ? this.formatDateOnly(f.paidDate) : null,
      createdAt: f.createdAt ? this.formatDateOnly(f.createdAt) : null,
    };
  }

  private normalizeAccruingFine(f: any): AccruingFine {
    return {
      ...f,
      dueDate: this.formatDateOnly(f.dueDate),
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
