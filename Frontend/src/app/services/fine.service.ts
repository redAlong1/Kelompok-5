import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Fine } from './borrowing.service';

export interface AccruingFine {
  borrowingItemId: number;
  bookTitle: string;
  dueDate: string;
  lateDays: number;
  estimatedAmount: number;
  isEstimate: boolean;
}

@Injectable({ providedIn: 'root' })
export class FineService {

  private readonly url = `${environment.apiUrl}/fines`;

  constructor(private http: HttpClient) {}

  getAll(status?: string, type?: string): Observable<Fine[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);
    return this.http.get<Fine[]>(this.url, { params });
  }

  getMine(): Observable<Fine[]> {
    return this.http.get<Fine[]>(`${this.url}/me`);
  }

  getAccruing(): Observable<AccruingFine[]> {
    return this.http.get<AccruingFine[]>(`${this.url}/me/accruing`);
  }

  pay(id: number): Observable<{ status: string; message: string }> {
    return this.http.post<{ status: string; message: string }>(`${this.url}/${id}/pay`, {});
  }
}
