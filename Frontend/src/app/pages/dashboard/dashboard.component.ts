import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

interface BorrowedBook {
  id: number;
  title: string;
  author: string;
  dueDate: string;
  daysLeft: number;
  coverColor: string;
  coverLabel: string;
}

interface Activity {
  type: 'borrow' | 'return' | 'reserve' | 'fine';
  description: string;
  date: string;
  isLate?: boolean;
}

interface ReservedBook {
  title: string;
  author: string;
  queue: number;
  coverColor: string;
  coverLabel: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  today: string = 'Kamis, 19 November 2026';
  userName: string = 'Andi';

  // Stat cards
  stats = {
    borrowed: 2,
    reserved: 1,
    fine: 5000,
    membership: 'Silver'
  };

  // Batas peminjaman
  borrowLimit = { max: 5, current: 2 };

  get borrowPercent(): number {
    return (this.borrowLimit.current / this.borrowLimit.max) * 100;
  }

  get remainingBorrow(): number {
    return this.borrowLimit.max - this.borrowLimit.current;
  }

  // Buku sedang dipinjam
  borrowedBooks: BorrowedBook[] = [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      dueDate: '24 Nov 2026',
      daysLeft: 5,
      coverColor: 'cover-blue',
      coverLabel: 'Clean Code'
    },
    {
      id: 2,
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      dueDate: '22 Nov 2026',
      daysLeft: 3,
      coverColor: 'cover-green',
      coverLabel: 'Laskar Pelangi'
    }
  ];

  // Reservasi aktif
  reservedBook: ReservedBook = {
    title: 'Dune',
    author: 'Frank Herbert',
    queue: 2,
    coverColor: 'cover-brown',
    coverLabel: 'Dune'
  };

  // Aktivitas terbaru
  activities: Activity[] = [
    { type: 'borrow',  description: 'Meminjam buku Clean Code',                            date: '10 Nov 2026' },
    { type: 'borrow',  description: 'Meminjam buku Laskar Pelangi',                        date: '8 Nov 2026' },
    { type: 'return',  description: 'Mengembalikan Atomic Habits (terlambat 5 hari)',       date: '6 Nov 2026', isLate: true },
    { type: 'reserve', description: 'Reservasi buku Dune',                                 date: '5 Nov 2026' },
  ];

  getActivityIcon(type: string, isLate?: boolean): string {
    if (type === 'return' && isLate) return 'bi-check-circle-fill text-success';
    if (type === 'borrow')  return 'bi-bookmark text-primary';
    if (type === 'return')  return 'bi-check-circle text-success';
    if (type === 'reserve') return 'bi-bookmark text-primary';
    return 'bi-info-circle text-muted';
  }

  getDaysLeftClass(days: number): string {
    if (days <= 2) return 'badge-days-urgent';
    if (days <= 5) return 'badge-days-warning';
    return 'badge-days-ok';
  }
}
