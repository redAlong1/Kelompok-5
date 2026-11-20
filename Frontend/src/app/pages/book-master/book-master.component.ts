import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export interface BookAuthorDto {
  authorId: number;
  authorName: string;
}
export interface BookCategoryDto {
  categoryId: number;
  categoryName: string;
}
export interface BookPublisherDto {
  publisherId: number;
  publisherName: string;
}

export interface BookResponse {
  bookId: number;
  title: string;
  isbn?: string;
  coverUrl?: string;
  price: number;
  description: string;
  createdAt: string;
  authorId: number;
  author?: BookAuthorDto;
  categoryId: number;
  category?: BookCategoryDto;
  publisherId: number;
  publisher?: BookPublisherDto;
  totalStock: number;
  availableStock: number;
}

export interface AuthorOption {
  authorId: number;
  authorName: string;
}
export interface CategoryOption {
  categoryId: number;
  categoryName: string;
}
export interface PublisherOption {
  publisherId: number;
  publisherName: string;
}

interface BookForm {
  title: string;
  isbn: string;
  coverUrl: string;
  price: number;
  description: string;
  authorId: number;
  categoryId: number;
  publisherId: number;
}

@Component({
  selector: 'app-book-master',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './book-master.component.html',
  styleUrl: './book-master.component.scss',
})
export class BookMasterComponent implements OnInit {
  private readonly bookUrl = `${environment.apiUrl}/book`;
  private readonly authorUrl = `${environment.apiUrl}/author`;
  private readonly categoryUrl = `${environment.apiUrl}/category`;
  private readonly publisherUrl = `${environment.apiUrl}/publishers`;

  items: BookResponse[] = [];
  filteredItems: BookResponse[] = [];
  pagedItems: BookResponse[] = [];

  authors: AuthorOption[] = [];
  categories: CategoryOption[] = [];
  publishers: PublisherOption[] = [];

  isLoading = false;
  errorMsg = '';

  searchQuery = '';
  sortDir: '' | 'asc' | 'desc' = '';
  sortField: 'title' | 'price' = 'title';

  currentPage = 1;
  pageSize = 5;

  showFormModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isSaving = false;
  formError = '';

  isUploadingCover = false;
  coverUploadError = '';
  previewUrl = '';

  form: BookForm = this.emptyForm();
  selectedItem: BookResponse | null = null;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize) || 1;
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get rangeStart(): number {
    return this.filteredItems.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }
  get rangeEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredItems.length,
    );
  }

  loadAll(): void {
    this.isLoading = true;
    this.errorMsg = '';
    const h = { headers: this.authHeaders() };
    forkJoin({
      books: this.http.get<BookResponse[]>(this.bookUrl, h),
      authors: this.http.get<AuthorOption[]>(this.authorUrl, h),
      categories: this.http.get<CategoryOption[]>(this.categoryUrl, h),
      publishers: this.http.get<PublisherOption[]>(this.publisherUrl, h),
    }).subscribe({
      next: (res) => {
        this.items = res.books;
        this.authors = res.authors;
        this.categories = res.categories;
        this.publishers = res.publishers;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'Gagal memuat data buku. Pastikan server berjalan.';
        this.isLoading = false;
      },
    });
  }

  loadBooks(): void {
    const h = { headers: this.authHeaders() };
    this.http.get<BookResponse[]>(this.bookUrl, h).subscribe({
      next: (data) => {
        this.items = data;
        this.applyFilter();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Gagal memuat data buku.';
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  toggleSort(field: 'title' | 'price' = 'title'): void {
    if (this.sortField !== field) {
      this.sortField = field;
      this.sortDir = 'asc';
    } else {
      if (this.sortDir === '') this.sortDir = 'asc';
      else if (this.sortDir === 'asc') this.sortDir = 'desc';
      else this.sortDir = '';
    }
    this.applyFilter();
  }

  goToPage(page: number, event: Event): void {
    event.preventDefault();
    this.currentPage = page;
    this.updatePage();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    let result = this.items.filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.isbn && p.isbn.toLowerCase().includes(q)) ||
        (p.author?.authorName && p.author.authorName.toLowerCase().includes(q)),
    );
    if (this.sortDir) {
      result = [...result].sort((a, b) => {
        if (this.sortField === 'price') {
          return this.sortDir === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0);
        }
        return this.sortDir === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      });
    }
    this.filteredItems = result;
    this.updatePage();
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedItems = this.filteredItems.slice(start, start + this.pageSize);
  }

  getCoverImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const backendBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    // Reset value so user can re-select same file if needed
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.coverUploadError = 'File harus berupa gambar (JPG, PNG, WEBP, GIF).';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.coverUploadError = 'Ukuran gambar maksimal 5 MB.';
      return;
    }

    this.coverUploadError = '';
    this.isUploadingCover = true;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post<{ url: string; fileName: string; message: string }>(
        `${this.bookUrl}/upload-cover`,
        formData,
        { headers: this.authHeaders() }
      )
      .subscribe({
        next: (res) => {
          this.form.coverUrl = res.url;
          this.previewUrl = this.getCoverImageUrl(res.url);
          this.isUploadingCover = false;
        },
        error: (err) => {
          this.isUploadingCover = false;
          this.coverUploadError = err?.error?.message || 'Gagal mengunggah gambar cover.';
        },
      });
  }

  removeCover(): void {
    this.form.coverUrl = '';
    this.previewUrl = '';
    this.coverUploadError = '';
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.form = this.emptyForm();
    this.previewUrl = '';
    this.coverUploadError = '';
    this.formError = '';
    this.selectedItem = null;
    this.showFormModal = true;
  }

  openEditModal(item: BookResponse): void {
    this.isEditMode = true;
    this.selectedItem = item;
    this.form = {
      title: item.title || '',
      isbn: item.isbn || '',
      coverUrl: item.coverUrl || '',
      price: item.price ?? 0,
      description: item.description || '',
      authorId: item.authorId,
      categoryId: item.categoryId,
      publisherId: item.publisherId,
    };
    this.previewUrl = this.getCoverImageUrl(item.coverUrl);
    this.coverUploadError = '';
    this.formError = '';
    this.showFormModal = true;
  }

  confirmDelete(item: BookResponse): void {
    this.selectedItem = item;
    this.formError = '';
    this.showDeleteModal = true;
  }

  saveItem(): void {
    if (!this.form.coverUrl.trim()) {
      this.formError = 'Cover buku wajib diunggah.';
      return;
    }
    if (!this.form.title.trim()) {
      this.formError = 'Judul buku tidak boleh kosong.';
      return;
    }
    if (!this.form.isbn.trim()) {
      this.formError = 'ISBN buku tidak boleh kosong.';
      return;
    }
    if (this.form.price === null || this.form.price === undefined || this.form.price < 0) {
      this.formError = 'Harga buku harus lebih besar atau sama dengan 0.';
      return;
    }
    if (!this.form.authorId) {
      this.formError = 'Pilih author terlebih dahulu.';
      return;
    }
    if (!this.form.categoryId) {
      this.formError = 'Pilih kategori terlebih dahulu.';
      return;
    }
    if (!this.form.publisherId) {
      this.formError = 'Pilih penerbit terlebih dahulu.';
      return;
    }
    if (!this.form.description) {
      this.formError = 'Deskripsi buku tidak boleh kosong.';
      return;
    }

    this.isSaving = true;
    this.formError = '';
    const body = {
      title: this.form.title.trim(),
      isbn: this.form.isbn.trim() || null,
      coverUrl: this.form.coverUrl.trim() || null,
      price: Number(this.form.price) || 0,
      description: this.form.description.trim() || null,
      authorId: this.form.authorId,
      categoryId: this.form.categoryId,
      publisherId: this.form.publisherId,
    };

    const req$ =
      this.isEditMode && this.selectedItem
        ? this.http.put<BookResponse>(
            `${this.bookUrl}/${this.selectedItem.bookId}`,
            body,
            { headers: this.authHeaders() },
          )
        : this.http.post<BookResponse>(this.bookUrl, body, {
            headers: this.authHeaders(),
          });

    req$.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeFormModal();
        this.loadBooks();
      },
      error: (err) => {
        this.isSaving = false;
        this.formError = err?.error?.message || 'Terjadi kesalahan. Coba lagi.';
      },
    });
  }

  deleteItem(): void {
    if (!this.selectedItem) return;
    this.isSaving = true;
    this.formError = '';
    this.http
      .delete(`${this.bookUrl}/${this.selectedItem.bookId}`, {
        headers: this.authHeaders(),
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showDeleteModal = false;
          this.selectedItem = null;
          this.loadBooks();
        },
        error: (err) => {
          this.isSaving = false;
          this.formError = err?.error?.message || 'Gagal menghapus buku.';
        },
      });
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.form = this.emptyForm();
    this.previewUrl = '';
    this.coverUploadError = '';
    this.formError = '';
  }
  closeBackdrop(): void {
    if (!this.isSaving) {
      this.showFormModal = false;
      this.showDeleteModal = false;
    }
  }

  private emptyForm(): BookForm {
    return {
      title: '',
      isbn: '',
      coverUrl: '',
      price: 0,
      description: '',
      authorId: 0,
      categoryId: 0,
      publisherId: 0,
    };
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}