import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface MembershipTier {
  membershipTierId: number;
  tierName: string;
  discount: number;
  minPoints: number;
  maxBorrowItems: number;
  borrowDurationDays: number;
  createdAt?: string;
  totalUsers?: number;
}

@Component({
  selector: 'app-member-tier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-tier.component.html',
  styleUrl: './member-tier.component.scss'
})
export class MemberTierComponent implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/member-tier`;

  items: MembershipTier[] = [];
  filteredItems: MembershipTier[] = [];
  pagedItems: MembershipTier[] = [];

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  searchQuery = '';
  sortColumn: 'tierName' | 'minPoints' | 'discount' | 'maxBorrowItems' | 'borrowDurationDays' = 'minPoints';
  sortDir: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 5;

  showFormModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSaving = false;
  formError = '';

  // Form Fields
  formTierName = '';
  formDiscount = 0;
  formMinPoints = 0;
  formMaxBorrowItems = 3;
  formBorrowDurationDays = 14;

  selectedItem: MembershipTier | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeStart(): number {
    return this.filteredItems.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredItems.length);
  }

  get totalMembers(): number {
    return this.items.reduce((sum, item) => sum + (item.totalUsers || 0), 0);
  }

  get highestTier(): string {
    if (this.items.length === 0) return '-';
    const sorted = [...this.items].sort((a, b) => b.minPoints - a.minPoints);
    return sorted[0].tierName;
  }

  loadItems(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http.get<MembershipTier[]>(this.apiUrl, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.items = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Gagal memuat data Member Tier. Pastikan server berjalan.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  sortBy(column: 'tierName' | 'minPoints' | 'discount' | 'maxBorrowItems' | 'borrowDurationDays'): void {
    if (this.sortColumn === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDir = 'asc';
    }
    this.applyFilter();
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    let result = this.items.filter(item =>
      !q || item.tierName.toLowerCase().includes(q)
    );

    result = [...result].sort((a, b) => {
      let valA: any = a[this.sortColumn];
      let valB: any = b[this.sortColumn];

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB as string);
        return this.sortDir === 'asc' ? comp : -comp;
      }

      valA = Number(valA);
      valB = Number(valB);
      return this.sortDir === 'asc' ? valA - valB : valB - valA;
    });

    this.filteredItems = result;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.formTierName = '';
    this.formDiscount = 0;
    this.formMinPoints = 0;
    this.formMaxBorrowItems = 3;
    this.formBorrowDurationDays = 14;
    this.formError = '';
    this.selectedItem = null;
    this.showFormModal = true;
  }

  openEditModal(item: MembershipTier): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.formTierName = item.tierName;
    this.formDiscount = item.discount;
    this.formMinPoints = item.minPoints;
    this.formMaxBorrowItems = item.maxBorrowItems;
    this.formBorrowDurationDays = item.borrowDurationDays;
    this.formError = '';
    this.showFormModal = true;
  }

  confirmDelete(item: MembershipTier): void {
    this.selectedItem = item;
    this.formError = '';
    this.showDeleteModal = true;
  }

  saveItem(): void {
    const name = this.formTierName.trim();
    if (!name) {
      this.formError = 'Nama tier tidak boleh kosong.';
      return;
    }
    if (this.formMinPoints < 0) {
      this.formError = 'Poin minimal tidak boleh kurang dari 0.';
      return;
    }
    if (this.formMaxBorrowItems < 1) {
      this.formError = 'Maksimal buku dipinjam minimal 1 buku.';
      return;
    }
    if (this.formBorrowDurationDays < 1) {
      this.formError = 'Durasi peminjaman minimal 1 hari.';
      return;
    }
    if (this.formDiscount < 0 || this.formDiscount > 100) {
      this.formError = 'Diskon denda harus bernilai antara 0% dan 100%.';
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const body = {
      tierName: name,
      discount: this.formDiscount,
      minPoints: this.formMinPoints,
      maxBorrowItems: this.formMaxBorrowItems,
      borrowDurationDays: this.formBorrowDurationDays
    };

    const req$ = this.isEditMode && this.selectedItem
      ? this.http.put<MembershipTier>(`${this.apiUrl}/${this.selectedItem.membershipTierId}`, body, { headers: this.authHeaders() })
      : this.http.post<MembershipTier>(this.apiUrl, body, { headers: this.authHeaders() });

    req$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeFormModal();
        this.showFlash('Tier berhasil disimpan!');
        this.loadItems();
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Terjadi kesalahan saat menyimpan tier. Silakan coba lagi.';
      }
    });
  }

  deleteItem(): void {
    if (!this.selectedItem) return;
    this.isSaving = true;
    this.formError = '';

    this.http.delete(`${this.apiUrl}/${this.selectedItem.membershipTierId}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showDeleteModal = false;
        const deletedName = this.selectedItem?.tierName;
        this.selectedItem = null;
        this.showFlash(`Tier '${deletedName}' berhasil dihapus.`);
        this.loadItems();
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Gagal menghapus Member Tier.';
      }
    });
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.formError = '';
  }

  closeBackdrop(): void {
    if (!this.isSaving) {
      this.showFormModal = false;
      this.showDeleteModal = false;
    }
  }

  getBadgeClass(tierName: string): string {
    const lower = tierName.toLowerCase();
    if (lower.includes('gold')) return 'badge-gold';
    if (lower.includes('silver')) return 'badge-silver';
    if (lower.includes('bronze')) return 'badge-bronze';
    if (lower.includes('platinum')) return 'badge-platinum';
    if (lower.includes('diamond')) return 'badge-diamond';
    return 'badge-default';
  }

  private showFlash(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => {
      this.successMsg = '';
    }, 4000);
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
