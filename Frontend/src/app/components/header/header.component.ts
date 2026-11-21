import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // SESUAIKAN path


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  get user() {
    return this.authService.getUser();
  }

  get initial(): string {
    return (this.user?.userName?.charAt(0) ?? '?').toUpperCase();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  // tutup dropdown kalau klik di luar header
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  

  logout(): void {
    this.authService.logout();
    this.isOpen = false;
    void this.router.navigate(['/landing']);
  }

ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.refreshUser().subscribe({ error: () => {} });
    }
  }

  get progress(): number {
    const u = this.user;
    if (!u || !u.nextTierMinPoints) return 100;
    return Math.min(100, (u.points / u.nextTierMinPoints) * 100);
  }
}

