import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string;
  createdAt: string;
}

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/category`;

  items: CategoryResponse[]         = [];
  filteredItems: CategoryResponse[]  = [];
  pagedItems: CategoryResponse[]     = [];

  isLoading = false;
  errorMsg  = '';

  searchQuery = '';
  sortDir: '' | 'asc' | 'desc' = '';

  currentPage = 1;
  pageSize    = 5;

  showFormModal   = false;
  showDeleteModal = false;
  isEditMode      = false;
  isSaving        = false;
  formError       = '';
  formName        = '';
  formDescription = '';

  selectedItem: CategoryResponse | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void { this.loadItems(); }

  get totalPages(): number { return Math.ceil(this.filteredItems.length / this.pageSize) || 1; }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get rangeStart(): number { return this.filteredItems.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get rangeEnd(): number { return Math.min(this.currentPage * this.pageSize, this.filteredItems.length); }

  loadItems(): void {
    this.isLoading = true;
    this.errorMsg  = '';
    this.http.get<CategoryResponse[]>(this.apiUrl, { headers: this.authHeaders() }).subscribe({
      next: data => { this.items = data; this.applyFilter(); this.isLoading = false; },
      error: ()   => { this.errorMsg = 'Gagal memuat data kategori. Pastikan server berjalan.'; this.isLoading = false; }
    });
  }

  onSearch(): void { this.currentPage = 1; this.applyFilter(); }

  toggleSort(): void {
    if (this.sortDir === '')         this.sortDir = 'asc';
    else if (this.sortDir === 'asc') this.sortDir = 'desc';
    else                             this.sortDir = '';
    this.applyFilter();
  }

  goToPage(page: number, event: Event): void { event.preventDefault(); this.currentPage = page; this.updatePage(); }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    let result = this.items.filter(p => !q || p.categoryName.toLowerCase().includes(q));
    if (this.sortDir === 'asc')       result = [...result].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    else if (this.sortDir === 'desc') result = [...result].sort((a, b) => b.categoryName.localeCompare(a.categoryName));
    this.filteredItems = result;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);
  }

  openAddModal(): void {
    this.isEditMode = false; this.formName = ''; this.formDescription = ''; this.formError = ''; this.selectedItem = null; this.showFormModal = true;
  }

  openEditModal(item: CategoryResponse): void {
    this.isEditMode = true; this.formName = item.categoryName; this.formDescription = item.description || '';
    this.formError = ''; this.selectedItem = item; this.showFormModal = true;
  }

  confirmDelete(item: CategoryResponse): void {
    this.selectedItem = item; this.formError = ''; this.showDeleteModal = true;
  }

  saveItem(): void {
    if (!this.formName.trim()) { this.formError = 'Nama kategori tidak boleh kosong.'; return; }
    this.isSaving = true; this.formError = '';
    const body = { categoryName: this.formName.trim(), description: this.formDescription.trim() || null };
    const req$ = this.isEditMode && this.selectedItem
      ? this.http.put<CategoryResponse>(`${this.apiUrl}/${this.selectedItem.categoryId}`, body, { headers: this.authHeaders() })
      : this.http.post<CategoryResponse>(this.apiUrl, body, { headers: this.authHeaders() });
    req$.subscribe({
      next: () => { this.isSaving = false; this.closeFormModal(); this.loadItems(); },
      error: err => { this.isSaving = false; this.formError = err?.error?.message || 'Terjadi kesalahan. Coba lagi.'; }
    });
  }

  deleteItem(): void {
    if (!this.selectedItem) return;
    this.isSaving = true; this.formError = '';
    this.http.delete(`${this.apiUrl}/${this.selectedItem.categoryId}`, { headers: this.authHeaders() }).subscribe({
      next: () => { this.isSaving = false; this.showDeleteModal = false; this.selectedItem = null; this.loadItems(); },
      error: err => { this.isSaving = false; this.formError = err?.error?.message || 'Gagal menghapus kategori.'; }
    });
  }

  closeFormModal(): void { this.showFormModal = false; this.formName = ''; this.formDescription = ''; this.formError = ''; }
  closeBackdrop(): void { if (!this.isSaving) { this.showFormModal = false; this.showDeleteModal = false; } }
  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
