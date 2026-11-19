import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserSummary {
  userId: number;
  userName: string;
  email: string;
  roleName: string;
  membershipTierName: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  user: UserSummary;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly url = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: LoginRequest, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, data).pipe(
      tap(res => this.saveSession(res, rememberMe))
    );
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.url}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  getUser(): UserSummary | null {
    const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUser()?.roleName === 'Admin';
  }

  private saveSession(res: LoginResponse, rememberMe: boolean): void {
    this.logout(); // bersihkan sesi lama
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', res.token);
    storage.setItem('user', JSON.stringify(res.user));
  }
}