
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Category {
  name: string;
  icon: string;
  color: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  rating: number;
  coverClass: string;
  coverIcon: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

  searchQuery = '';

  categories: Category[] = [
    { name: 'Programming', icon: 'bi-code-slash', color: 'blue' },
    { name: 'Science', icon: 'bi-flask', color: 'green' },
    { name: 'Novel', icon: 'bi-book-half', color: 'purple' },
    { name: 'History', icon: 'bi-bank', color: 'orange' }
  ];

  books: Book[] = [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Programming',
      rating: 4.8,
      coverClass: 'cover-blue',
      coverIcon: 'bi-code-square'
    },
    {
      id: 2,
      title: 'Database System Concepts',
      author: 'Silberschatz',
      category: 'Programming',
      rating: 4.7,
      coverClass: 'cover-purple',
      coverIcon: 'bi-database'
    },
    {
      id: 3,
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      category: 'Novel',
      rating: 4.8,
      coverClass: 'cover-orange',
      coverIcon: 'bi-book'
    },
    {
      id: 4,
      title: 'Atomic Habits',
      author: 'James Clear',
      category: 'Self Development',
      rating: 4.9,
      coverClass: 'cover-yellow',
      coverIcon: 'bi-lightning'
    }
  ];

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

  searchBooks(): void {
    console.log('Searching:', this.searchQuery);
  }
}
