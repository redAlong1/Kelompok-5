import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;   // SESUAIKAN dengan nama field di DTO backend
  password: string;
}

export interface LoginResponse {
  token: string;      // SESUAIKAN dengan response backend (misal accessToken)
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly url = `${environment.apiUrl}/auth`;   // SESUAIKAN route controller

  constructor(private http: HttpClient) {}

  login(data: LoginRequest, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, data).pipe(
      tap(res => this.saveToken(res.token, rememberMe))
    );
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
    this.logout(); // bersihkan token lama di kedua storage
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', token);
  }
}