import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer, tap, delay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;   // SESUAIKAN dengan DTO backend
  password: string;
}

export interface LoginResponse {
  token: string;      // SESUAIKAN dengan response backend
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
    const request$ = environment.useMock
      ? this.mockLogin(data)
      : this.http.post<LoginResponse>(`${this.url}/login`, data);

    return request$.pipe(
      tap(res => this.saveToken(res.token, rememberMe))
    );
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.url}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveToken(token: string, rememberMe: boolean): void {
    this.logout();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
  }

  // ===== MOCK: hapus method ini kalau API sudah jadi =====
  private mockLogin(data: LoginRequest): Observable<LoginResponse> {
    const valid = data.username === 'admin' && data.password === 'admin123';

    if (!valid) {
      return timer(800).pipe(
        switchMap(() => throwError(() =>
          new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })
        ))
      );
    }

    return of({ token: 'mock-token-123' }).pipe(delay(800));
  }
}