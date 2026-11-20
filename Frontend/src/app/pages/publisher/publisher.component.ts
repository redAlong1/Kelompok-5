import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface PublisherResponse {
  publisherId: number;
  publisherName: string;
  createdAt: string;
}

@Component({
  selector: 'app-publisher',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './publisher.component.html',
  styleUrl: './publisher.component.scss'
})
export class PublisherComponent implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/publishers`;

  // ----------------------------------------------------------------
  //  State
  // ----------------------------------------------------------------
  publishers: PublisherResponse[]        = [];
  filteredPublishers: PublisherResponse[] = [];
  pagedPublishers: PublisherResponse[]    = [];

  isLoading = false;
  errorMsg  = '';

  // Search & Sort
  searchQuery = '';
  sortDir: '' | 'asc' | 'desc' = '';

  // Pagination
  currentPage = 1;
  pageSize    = 5;

  // Modal state
  showFormModal   = false;
  showDeleteModal = false;
  isEditMode      = false;
  isSaving        = false;
  formError       = '';
  formName        = '';

  selectedPublisher: PublisherResponse | null = null;

  // ----------------------------------------------------------------
  constructor(private http: HttpClient, private auth: AuthService) {}

  // ----------------------------------------------------------------
  //  Lifecycle
  // ----------------------------------------------------------------
  ngOnInit(): void {
    this.loadPublishers();
  }

  // ----------------------------------------------------------------
  //  Computed
  // ----------------------------------------------------------------
  get totalPages(): number {
    return Math.ceil(this.filteredPublishers.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get rangeStart(): number {
    if (this.filteredPublishers.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPublishers.length);
  }

  // ----------------------------------------------------------------
  //  API
  // ----------------------------------------------------------------
  loadPublishers(): void {
    this.isLoading = true;
    this.errorMsg  = '';
    this.http.get<PublisherResponse[]>(this.apiUrl, { headers: this.authHeaders() }).subscribe({
      next: data => {
        this.publishers = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg  = 'Gagal memuat data penerbit. Pastikan server berjalan.';
        this.isLoading = false;
      }
    });
  }

  // ----------------------------------------------------------------
  //  Search / Sort / Pagination
  // ----------------------------------------------------------------
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  toggleSort(): void {
    if (this.sortDir === '')      this.sortDir = 'asc';
    else if (this.sortDir === 'asc')  this.sortDir = 'desc';
    else                          this.sortDir = '';
    this.applyFilter();
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    this.updatePage();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();

    let result = this.publishers.filter(p =>
      !q || p.publisherName.toLowerCase().includes(q)
    );

    if (this.sortDir === 'asc') {
      result = [...result].sort((a, b) => a.publisherName.localeCompare(b.publisherName));
    } else if (this.sortDir === 'desc') {
      result = [...result].sort((a, b) => b.publisherName.localeCompare(a.publisherName));
    }

    this.filteredPublishers = result;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedPublishers = this.filteredPublishers.slice(start, start + this.pageSize);
  }

  // ----------------------------------------------------------------
  //  Modal: Tambah
  // ----------------------------------------------------------------
  openAddModal(): void {
    this.isEditMode       = false;
    this.formName         = '';
    this.formError        = '';
    this.selectedPublisher = null;
    this.showFormModal    = true;
  }

  // ----------------------------------------------------------------
  //  Modal: Edit
  // ----------------------------------------------------------------
  openEditModal(pub: PublisherResponse): void {
    this.isEditMode       = true;
    this.formName         = pub.publisherName;
    this.formError        = '';
    this.selectedPublisher = pub;
    this.showFormModal    = true;
  }

  // ----------------------------------------------------------------
  //  Modal: Hapus
  // ----------------------------------------------------------------
  confirmDelete(pub: PublisherResponse): void {
    this.selectedPublisher = pub;
    this.formError         = '';
    this.showDeleteModal   = true;
  }

  // ----------------------------------------------------------------
  //  Save (Create / Update)
  // ----------------------------------------------------------------
  savePublisher(): void {
    if (!this.formName.trim()) {
      this.formError = 'Nama penerbit tidak boleh kosong.';
      return;
    }

    this.isSaving  = true;
    this.formError = '';
    const body     = { publisherName: this.formName.trim() };

    const request$ = this.isEditMode && this.selectedPublisher
      ? this.http.put<PublisherResponse>(`${this.apiUrl}/${this.selectedPublisher.publisherId}`, body, { headers: this.authHeaders() })
      : this.http.post<PublisherResponse>(this.apiUrl, body, { headers: this.authHeaders() });

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeFormModal();
        this.loadPublishers();
      },
      error: err => {
        this.isSaving  = false;
        this.formError = err?.error?.message || 'Terjadi kesalahan. Coba lagi.';
      }
    });
  }

  // ----------------------------------------------------------------
  //  Delete
  // ----------------------------------------------------------------
  deletePublisher(): void {
    if (!this.selectedPublisher) return;
    this.isSaving  = true;
    this.formError = '';

    this.http.delete(`${this.apiUrl}/${this.selectedPublisher.publisherId}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this.isSaving        = false;
        this.showDeleteModal = false;
        this.selectedPublisher = null;
        this.loadPublishers();
      },
      error: err => {
        this.isSaving  = false;
        this.formError = err?.error?.message || 'Gagal menghapus penerbit.';
      }
    });
  }

  // ----------------------------------------------------------------
  //  Helpers
  // ----------------------------------------------------------------
  closeFormModal(): void {
    this.showFormModal = false;
    this.formName      = '';
    this.formError     = '';
  }

  closeBackdrop(): void {
    if (!this.isSaving) {
      this.showFormModal   = false;
      this.showDeleteModal = false;
    }
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
