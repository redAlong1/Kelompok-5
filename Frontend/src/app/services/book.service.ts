import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookAuthorDto {
  authorId: number;
  authorName: string;
}

export interface BookCategoryDto {
  categoryId: number;
  categoryName: string;
}

export interface BookPublisherDto {
  publisherId: number;
  publisherName: string;
}

export interface BookInventoryDto {
  inventoryId: number;
  availabilityStatus: string;
}

export interface BookResponse {
  bookId: number;
  title: string;
  isbn?: string;
  coverUrl?: string;
  description?: string;
  createdAt: string;
  authorId: number;
  author?: BookAuthorDto;
  categoryId: number;
  category?: BookCategoryDto;
  publisherId: number;
  publisher?: BookPublisherDto;
  totalStock: number;
  availableStock: number;
  inventories?: BookInventoryDto[];
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description?: string;
  createdAt?: string;
}

export interface GetBooksQuery {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  stock_status?: string;
  sort?: string;
  order?: number;
}

// Model yang digunakan di UI Catalog dan Reservation
export interface BookItem {
  bookId: number;
  title: string;
  authorName: string;
  categoryName?: string;
  categoryId?: number;
  coverColor?: string;
  coverUrl?: string;
  rating?: number;
  stock: number;
  isBorrowed?: boolean;
  estimatedAvailableDate?: string;
  isbn?: string;
  description?: string;
}

export type CatalogBook = BookItem;

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly bookApiUrl = `${environment.apiUrl}/book`;
  private readonly categoryApiUrl = `${environment.apiUrl}/category`;

  constructor(private http: HttpClient) {}

  getAll(query?: GetBooksQuery): Observable<BookResponse[]> {
    let params = new HttpParams();

    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.category_id) params = params.set('category_id', query.category_id.toString());
      if (query.stock_status) params = params.set('stock_status', query.stock_status);
      if (query.sort) params = params.set('sort', query.sort);
      if (query.order !== undefined) params = params.set('order', query.order.toString());
    }

    return this.http.get<BookResponse[]>(this.bookApiUrl, { params });
  }

  getById(id: number): Observable<BookResponse> {
    return this.http.get<BookResponse>(`${this.bookApiUrl}/${id}`);
  }

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.categoryApiUrl);
  }
}
