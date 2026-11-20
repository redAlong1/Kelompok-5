import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateBookReservationRequest {
  bookId: number;
  notes?: string;
}

export interface BookReservationResponse {
  bookReservationId: number;
  userId: number;
  userName: string;
  bookId: number;
  bookTitle: string;
  authorName?: string;
  coverUrl?: string;
  reservationDate: string;
  status: string; // 'ACTIVE', 'COMPLETE', 'CANCELLED'
  queueNumber?: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookReservationService {
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getMyReservations(): Observable<BookReservationResponse[]> {
    return this.http.get<BookReservationResponse[]>(`${this.apiUrl}/my`);
  }

  getById(id: number): Observable<BookReservationResponse> {
    return this.http.get<BookReservationResponse>(`${this.apiUrl}/${id}`);
  }

  create(req: CreateBookReservationRequest): Observable<BookReservationResponse> {
    return this.http.post<BookReservationResponse>(this.apiUrl, req);
  }

  cancel(id: number): Observable<{ status: string; message: string }> {
    return this.http.patch<{ status: string; message: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
