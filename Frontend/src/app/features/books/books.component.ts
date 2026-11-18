
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Book {
  bookId: number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  publisher: string;
  status: string;
}

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  getAvailableCount(): number {
  return this.books.filter(
    book => book.status === 'Available'
  ).length;
}

  books: Book[] = [
    {
      bookId: 1,
      title: 'Atomic Habits',
      isbn: '9780735211292',
      author: 'James Clear',
      category: 'Self Development',
      publisher: 'Penguin Random House',
      status: 'Available'
    },
    {
      bookId: 2,
      title: 'Clean Code',
      isbn: '9780132350884',
      author: 'Robert C. Martin',
      category: 'Technology',
      publisher: 'Prentice Hall',
      status: 'Borrowed'
    },
    {
      bookId: 3,
      title: 'Rich Dad Poor Dad',
      isbn: '9781612680194',
      author: 'Robert Kiyosaki',
      category: 'Finance',
      publisher: 'Plata Publishing',
      status: 'Available'
    },
    {
      bookId: 4,
      title: 'The Pragmatic Programmer',
      isbn: '9780135957059',
      author: 'David Thomas',
      category: 'Technology',
      publisher: 'Addison-Wesley',
      status: 'Available'
    }
  ];

}
