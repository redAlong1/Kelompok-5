import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface Book {
  bookId: number;
  title: string;
  authorName: string;
  categoryName: string;
  image: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  
  // Data dummy (nanti diganti dengan data dari API Backend)
  books: Book[] = [
    { bookId: 1, title: 'Clean Code', authorName: 'Robert C. Martin', categoryName: 'Programming', image: 'assets/clean-code.jpg' },
    { bookId: 2, title: 'Database System Concepts', authorName: 'Silberschatz', categoryName: 'Computer Science', image: 'assets/database.jpg' },
    { bookId: 3, title: 'Laskar Pelangi', authorName: 'Andrea Hirata', categoryName: 'Novel', image: 'assets/laskar-pelangi.jpg' },
    { bookId: 4, title: 'Atomic Habits', authorName: 'James Clear', categoryName: 'Self Improvement', image: 'assets/atomic-habits.jpg' }
  ];

  constructor(private router: Router) {}

  // Fungsi navigasi ke detail buku
  goToDetail(bookId: number) {
    this.router.navigate(['/books', bookId]);
  }

  // Fungsi tombol pinjam di katalog
  pinjamBuku(event: Event, bookTitle: string) {
    event.stopPropagation(); 
    alert(`Mengajukan peminjaman untuk buku: ${bookTitle}`);
  }
}