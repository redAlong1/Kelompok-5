import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

interface Book {
  bookId: number;
  title: string;
  authorName: string;
  categoryName: string;
  coverColor: string;
  rating: number;
  stock: number;
  isBorrowed?: boolean;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SidebarComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {

  searchQuery: string = '';
  selectedSort: string = 'popular';
  activeCategory: string = 'Semua';

  categories: string[] = [
    'Semua', 'Programming', 'Database', 'Novel',
    'Sejarah', 'Fiksi Ilmiah', 'Pengembangan Diri'
  ];

  // Data dummy (nanti diganti dengan data dari API Backend)
  allBooks: Book[] = [
    { bookId: 1,  title: 'Clean Code',               authorName: 'Robert C. Martin',  categoryName: 'Programming',       coverColor: 'cover-blue',    rating: 4.8, stock: 5 },
    { bookId: 2,  title: 'Database System Concepts',  authorName: 'Silberschatz',       categoryName: 'Database',          coverColor: 'cover-teal',    rating: 4.7, stock: 3 },
    { bookId: 3,  title: 'Laskar Pelangi',            authorName: 'Andrea Hirata',      categoryName: 'Novel',             coverColor: 'cover-green',   rating: 4.8, stock: 10 },
    { bookId: 4,  title: 'Atomic Habits',             authorName: 'James Clear',        categoryName: 'Pengembangan Diri', coverColor: 'cover-orange',  rating: 4.8, stock: 7 },
    { bookId: 5,  title: 'Dune',                      authorName: 'Frank Herbert',      categoryName: 'Fiksi Ilmiah',      coverColor: 'cover-brown',   rating: 4.7, stock: 4, isBorrowed: false },
    { bookId: 6,  title: 'The Pragmatic Programmer',  authorName: 'Hunt & Thomas',      categoryName: 'Programming',       coverColor: 'cover-purple',  rating: 4.7, stock: 2, isBorrowed: true },
    { bookId: 7,  title: 'Sapiens',                   authorName: 'Yuval Noah Harari',  categoryName: 'Sejarah',           coverColor: 'cover-dark',    rating: 4.6, stock: 4 },
    { bookId: 8,  title: 'Bumi Manusia',              authorName: 'Pramoedya Ananta Toer', categoryName: 'Novel',          coverColor: 'cover-pink',    rating: 4.9, stock: 6 },
  ];

  get books(): Book[] {
    let filtered = this.allBooks;

    if (this.activeCategory !== 'Semua') {
      filtered = filtered.filter(b => b.categoryName === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  constructor(private router: Router) {}

  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  goToDetail(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  pinjamBuku(event: Event, book: Book) {
    event.stopPropagation();
    if (book.stock > 0 && !book.isBorrowed) {
      alert(`Mengajukan peminjaman untuk buku: ${book.title}`);
    }
  }

  getRatingArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
}
