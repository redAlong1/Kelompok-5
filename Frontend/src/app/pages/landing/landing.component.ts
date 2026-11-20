
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookService, BookResponse } from '../../services/book.service';

interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  coverClass: string;
  coverIcon: string;
  coverUrl?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {

  searchQuery = '';
  loading = false;

  // Hanya buku ID 1 sampai 4
  private readonly allowedBookIds = [1, 2, 3, 4];

  // Dummy cover berdasarkan ID buku
  private readonly dummyCovers: Record<number, string> = {
    1: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5lk36WPh_HzD6aGkEauYESmRmLwuORrET1oYgfs5QyJBHbaLJz37-clE&s=10',
    2: 'https://gpu.id/data-gpu/images/uploads/dirimg_buku/616153002.jpg',
    3: 'https://d1y2du6z1jfm9e.cloudfront.net/covers/a4837769-0d51-4156-b6b5-3132cd0f1396_regen_1782353178.webp',
    4: 'https://opacperpustakaan.jogjakota.go.id/inlislite3/uploaded_files/sampul_koleksi/original/Monograf/52643.jpg'
  };

  // Gambar cadangan
  private readonly fallbackCover =
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80';

  categories: Category[] = [
    { name: 'Programming', icon: 'bi-code-slash', color: 'blue' },
    { name: 'Science', icon: 'bi-flask', color: 'green' },
    { name: 'Novel', icon: 'bi-book-half', color: 'purple' },
    { name: 'History', icon: 'bi-bank', color: 'orange' }
  ];

  books: Book[] = [];

  private readonly coverClasses = [
    'cover-blue',
    'cover-purple',
    'cover-orange',
    'cover-yellow',
    'cover-green',
    'cover-teal'
  ];

  private readonly coverIcons = [
    'bi-code-square',
    'bi-database',
    'bi-book',
    'bi-lightning',
    'bi-journal-bookmark'
  ];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  // Mengambil data buku dari API
  loadBooks(): void {

    this.loading = true;

    this.bookService.getAll({
      search: this.searchQuery.trim() || undefined,
      limit: 100
    }).subscribe({

      next: (data: BookResponse[]) => {

        // Filter hanya ID 1, 2, 3, dan 4
        this.books = data
          .filter((b: BookResponse) =>
            this.allowedBookIds.includes(Number(b.bookId))
          )
          .map((b: BookResponse, index: number) =>
            this.mapToBook(b, index)
          );

        this.loading = false;

      },

      error: (err) => {

        console.error('Gagal memuat buku dari API:', err);

        this.books = [];
        this.loading = false;

      }

    });

  }

  // Mapping data API ke model Book
  private mapToBook(b: BookResponse, index: number): Book {

    const bookId = Number(b.bookId);

    return {
      id: bookId,
      title: b.title,
      author: b.author?.authorName || 'Penulis Tidak Diketahui',
      category: b.category?.categoryName || 'Umum',
      rating: 4.8,

      coverClass: this.coverClasses[index % this.coverClasses.length],

      coverIcon: this.coverIcons[index % this.coverIcons.length],

      // Gunakan gambar dummy berdasarkan ID
      coverUrl: this.getDummyCover(bookId)
    };

  }

  // Mendapatkan gambar dummy berdasarkan ID
  getDummyCover(bookId: number): string {

    return this.dummyCovers[bookId] || this.fallbackCover;

  }

  // Jika gambar gagal dimuat
  onCoverError(event: Event): void {

    const img = event.target as HTMLImageElement;

    // Mencegah error berulang
    img.onerror = null;

    img.src = this.fallbackCover;

  }

  // Filter pencarian buku
  get filteredBooks(): Book[] {

    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return this.books;
    }

    return this.books.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query)
    );

  }

  // Tombol pencarian
  searchBooks(): void {

    this.loadBooks();

  }

}
