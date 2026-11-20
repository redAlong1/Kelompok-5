import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface InventoryItem {
  inventoryId: number;
  bookId: number;
  bookTitle: string;
  bookIsbn?: string;
  shelfLocation: string;
  availabilityStatus: number | string;
  statusName?: string;
}

export interface BookOption {
  bookId: number;
  title: string;
  isbn?: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {

  private readonly inventoryUrl = `${environment.apiUrl}/inventory`;
  private readonly bookUrl = `${environment.apiUrl}/book`;

  items: InventoryItem[] = [];
  filteredItems: InventoryItem[] = [];
  pagedItems: InventoryItem[] = [];
  books: BookOption[] = [];

  isLoading = false;
  errorMsg = '';

  searchQuery = '';
  statusFilter = '';
  sortDir: '' | 'asc' | 'desc' = '';

  currentPage = 1;
  pageSize = 10;

  showAddModal = false;
  showEditModal = false;
  showDeleteModal = false;
  isSaving = false;
  formError = '';

  addForm = {
    bookId: 0,
    shelfLocation: '',
    quantity: 1
  };

  editForm = {
    shelfLocation: '',
    availabilityStatus: 0
  };

  selectedItem: InventoryItem | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadData();
  }

  get totalItems(): number {
    return this.items.length;
  }

  get availableCount(): number {
    return this.items.filter(i => this.normalizeStatus(i) === 'AVAILABLE').length;
  }

  get borrowedCount(): number {
    return this.items.filter(i => this.normalizeStatus(i) === 'BORROWED').length;
  }

  get reservedCount(): number {
    return this.items.filter(i => this.normalizeStatus(i) === 'RESERVED').length;
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

  loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';
    const h = { headers: this.authHeaders() };

    forkJoin({
      inventories: this.http.get<InventoryItem[]>(this.inventoryUrl, h),
      books: this.http.get<BookOption[]>(this.bookUrl, h)
    }).subscribe({
      next: res => {
        this.items = res.inventories;
        this.books = res.books;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Gagal memuat data inventory. Pastikan server backend aktif.';
        this.isLoading = false;
      }
    });
  }

  loadInventories(): void {
    const h = { headers: this.authHeaders() };
    this.http.get<InventoryItem[]>(this.inventoryUrl, h).subscribe({
      next: data => {
        this.items = data;
        this.applyFilter();
      },
      error: err => {
        this.errorMsg = err?.error?.message || 'Gagal memperbarui data inventory.';
      }
    });
  }

  normalizeStatus(item: InventoryItem): string {
    if (typeof item.availabilityStatus === 'string') {
      return item.availabilityStatus.toUpperCase();
    }
    if (item.availabilityStatus === 0) return 'AVAILABLE';
    if (item.availabilityStatus === 1) return 'BORROWED';
    if (item.availabilityStatus === 2) return 'RESERVED';
    return item.statusName ? item.statusName.toUpperCase() : 'AVAILABLE';
  }

  statusBadgeClass(item: InventoryItem): string {
    const s = this.normalizeStatus(item);
    if (s === 'AVAILABLE') return 'bg-success-subtle text-success border border-success-subtle';
    if (s === 'BORROWED') return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    if (s === 'RESERVED') return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    return 'bg-secondary-subtle text-secondary';
  }

  statusLabel(item: InventoryItem): string {
    const s = this.normalizeStatus(item);
    if (s === 'AVAILABLE') return 'Tersedia';
    if (s === 'BORROWED') return 'Dipinjam';
    if (s === 'RESERVED') return 'Direservasi';
    return s;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onFilterStatus(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilter();
  }

  toggleSort(): void {
    if (this.sortDir === '') this.sortDir = 'asc';
    else if (this.sortDir === 'asc') this.sortDir = 'desc';
    else this.sortDir = '';
    this.applyFilter();
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    this.updatePage();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    let result = this.items.filter(item => {
      const matchSearch = !q ||
        (item.bookTitle && item.bookTitle.toLowerCase().includes(q)) ||
        (item.bookIsbn && item.bookIsbn.toLowerCase().includes(q)) ||
        (item.shelfLocation && item.shelfLocation.toLowerCase().includes(q)) ||
        item.inventoryId.toString().includes(q);

      const matchStatus = !this.statusFilter || this.normalizeStatus(item) === this.statusFilter;

      return matchSearch && matchStatus;
    });

    if (this.sortDir === 'asc') {
      result = [...result].sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
    } else if (this.sortDir === 'desc') {
      result = [...result].sort((a, b) => b.bookTitle.localeCompare(a.bookTitle));
    }

    this.filteredItems = result;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);
  }

  openAddModal(): void {
    this.formError = '';
    this.addForm = {
      bookId: this.books.length > 0 ? this.books[0].bookId : 0,
      shelfLocation: '',
      quantity: 1
    };
    this.showAddModal = true;
  }

  openEditModal(item: InventoryItem): void {
    this.selectedItem = item;
    const currentStatus = this.normalizeStatus(item);
    let statusCode = 0;
    if (currentStatus === 'BORROWED') statusCode = 1;
    else if (currentStatus === 'RESERVED') statusCode = 2;

    this.editForm = {
      shelfLocation: item.shelfLocation || '',
      availabilityStatus: statusCode
    };
    this.formError = '';
    this.showEditModal = true;
  }

  confirmDelete(item: InventoryItem): void {
    this.selectedItem = item;
    this.formError = '';
    this.showDeleteModal = true;
  }

  saveAdd(): void {
    if (!this.addForm.bookId) {
      this.formError = 'Pilih buku terlebih dahulu.';
      return;
    }
    if (this.addForm.quantity < 1 || this.addForm.quantity > 100) {
      this.formError = 'Jumlah eksemplar harus antara 1 sampai 100.';
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const body = {
      bookId: Number(this.addForm.bookId),
      shelfLocation: this.addForm.shelfLocation.trim(),
      quantity: Number(this.addForm.quantity),
      availabilityStatus: 0
    };

    this.http.post(this.inventoryUrl, body, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAddModal = false;
        this.loadInventories();
      },
      error: err => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Gagal menambahkan eksemplar inventory.';
      }
    });
  }

  saveEdit(): void {
    if (!this.selectedItem) return;

    this.isSaving = true;
    this.formError = '';

    const body = {
      shelfLocation: this.editForm.shelfLocation.trim(),
      availabilityStatus: Number(this.editForm.availabilityStatus)
    };

    this.http.put(`${this.inventoryUrl}/${this.selectedItem.inventoryId}`, body, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showEditModal = false;
        this.selectedItem = null;
        this.loadInventories();
      },
      error: err => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Gagal memperbarui eksemplar.';
      }
    });
  }

  deleteItem(): void {
    if (!this.selectedItem) return;

    this.isSaving = true;
    this.formError = '';

    this.http.delete(`${this.inventoryUrl}/${this.selectedItem.inventoryId}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showDeleteModal = false;
        this.selectedItem = null;
        this.loadInventories();
      },
      error: err => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Gagal menghapus eksemplar.';
      }
    });
  }

  closeModals(): void {
    if (!this.isSaving) {
      this.showAddModal = false;
      this.showEditModal = false;
      this.showDeleteModal = false;
      this.selectedItem = null;
      this.formError = '';
    }
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
