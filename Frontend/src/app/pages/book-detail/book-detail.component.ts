
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface BookDetail {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  coverClass: string;
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {

  bookId = 1;
  isFavorite = false;

  book: BookDetail = {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Programming',
    publisher: 'Prentice Hall',
    year: 2008,
    stock: 5,
    rating: 4.8,
    reviews: 120,
    description: `Clean Code merupakan buku yang membahas prinsip-prinsip
    penulisan kode yang bersih, mudah dipahami, dan mudah dipelihara.

    Buku ini memberikan panduan praktis bagi developer untuk menghasilkan
    software berkualitas melalui penulisan kode yang lebih baik.

    Cocok untuk programmer pemula maupun profesional yang ingin meningkatkan
    kemampuan dalam software development.`,
    coverClass: 'cover-blue'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.bookId = Number(params.get('id')) || 1;
      this.loadBook();
    });
  }

  loadBook(): void {
    // Dummy data sementara.
    // Nantinya akan diganti dengan pemanggilan BookService/API.
    console.log('Loading book ID:', this.bookId);
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    this.isFavorite = !this.isFavorite;
  }

  borrowBook(): void {
    if (!this.isLoggedIn()) {
      this.goToLogin();
      return;
    }

    if (this.book.stock <= 0) {
      alert('Maaf, buku sedang tidak tersedia.');
      return;
    }

    alert(`Permintaan peminjaman ${this.book.title} berhasil disimulasikan!`);
  }

  private isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  private goToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}
