import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type BookCondition = 'GOOD' | 'DAMAGED_LIGHT' | 'DAMAGED_HEAVY' | 'LOST';

export interface BorrowingItem {
  borrowingItemId: number;
  inventoryId: number;
  bookTitle: string;
  shelfLocation: string;
  returnDate: string | null;
  returnCondition: string | null;
  lateDays: number | null;
}

export interface Borrowing {
  bookBorrowingTransactionId: number;
  userId: number;
  username: string;
  status: string;
  borrowDate: string;
  dueDate: string;
  items: BorrowingItem[];
}

export interface Fine {
  fineId: number;
  bookTitle: string;
  fineType: string;
  baseAmount: number;
  discountAmount: number;
  amount: number;
  fineStatus: string;
}

export interface ReturnItemRequest {
  borrowingItemId: number;
  condition: BookCondition;
}

export interface ReturnResult {
  borrowing: Borrowing;
  fines: Fine[];
}

@Injectable({ providedIn: 'root' })
export class BorrowingService {

  private readonly url = `${environment.apiUrl}/borrowings`;

  constructor(private http: HttpClient) { }

  getAll(status?: string): Observable<Borrowing[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Borrowing[]>(this.url, { params });
  }
  getMine(): Observable<Borrowing[]> {
    return this.http.get<Borrowing[]>(`${this.url}/me`);
  }
  returnBooks(transactionId: number, items: ReturnItemRequest[]): Observable<ReturnResult> {
    return this.http.post<ReturnResult>(`${this.url}/${transactionId}/return`, { items });
  }
}