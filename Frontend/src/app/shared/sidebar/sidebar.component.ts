import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // SESUAIKAN path

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  collapsed = false;

  constructor(public authService: AuthService) {
    try {
      this.collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    } catch { /* abaikan */ }
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
    try {
      localStorage.setItem('sidebarCollapsed', String(this.collapsed));
    } catch { /* abaikan */ }
  }
}