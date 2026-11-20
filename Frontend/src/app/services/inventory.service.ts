import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InventoryResponse {
  inventoryId: number;
  bookId: number;
  bookTitle?: string;
  bookIsbn?: string;
  shelfLocation?: string;
  availabilityStatus: number | string;
  statusName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getAll(bookId?: number): Observable<InventoryResponse[]> {
    let params = new HttpParams();
    if (bookId !== undefined && bookId !== null && bookId > 0) {
      params = params.set('bookId', bookId.toString());
    }
    return this.http.get<InventoryResponse[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<InventoryResponse> {
    return this.http.get<InventoryResponse>(`${this.apiUrl}/${id}`);
  }
}
