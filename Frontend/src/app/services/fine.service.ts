import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getMine(): Observable<Fine[]> {
    return this.http.get<Fine[]>(`${this.url}/me`);
  }

  getAccruing(): Observable<AccruingFine[]> {
    return this.http.get<AccruingFine[]>(`${this.url}/me/accruing`);
  }
}