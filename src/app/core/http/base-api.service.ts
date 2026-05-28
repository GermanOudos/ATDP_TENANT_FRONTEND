import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseResponse, PaginatedResponse } from '@schemas/api-response.schema';
import { unwrapResponse } from '@shared/utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected readonly http = inject(HttpClient);

  protected get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<BaseResponse<T>>(url, { params })
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected post<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .post<BaseResponse<T>>(url, body)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected postForm<T>(url: string, formData: FormData): Observable<T> {
    return this.http
      .post<BaseResponse<T>>(url, formData)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected put<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .put<BaseResponse<T>>(url, body)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected putForm<T>(url: string, formData: FormData): Observable<T> {
    return this.http
      .put<BaseResponse<T>>(url, formData)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected patch<T>(url: string, body: unknown): Observable<T> {
    return this.http
      .patch<BaseResponse<T>>(url, body)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http
      .delete<BaseResponse<T>>(url)
      .pipe(map((res) => unwrapResponse(res)));
  }

  protected getPaginated<T>(url: string, params?: HttpParams): Observable<PaginatedResponse<T>> {
    return this.http
      .get<BaseResponse<PaginatedResponse<T>>>(url, { params })
      .pipe(map((res) => unwrapResponse(res)));
  }
}
