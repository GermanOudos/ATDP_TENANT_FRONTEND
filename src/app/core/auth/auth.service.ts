import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LoginRequest, AuthResponse, authResponseSchema } from '@schemas/auth.schema';
import { BaseResponse } from '@schemas/api-response.schema';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private parseAuthPayload(payload: unknown): AuthResponse {
    const wrapped = payload as BaseResponse<AuthResponse>;
    const candidate = wrapped?.data ?? payload;
    const parsed = authResponseSchema.safeParse(candidate);
    if (!parsed.success) {
      throw new Error('Respuesta de autenticacion invalida del backend.');
    }
    return parsed.data;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<BaseResponse<AuthResponse>>('/api/auth/login/admin', credentials, {
        withCredentials: true,
      })
      .pipe(map((res) => this.parseAuthPayload(res)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>('/api/auth/logout', {}, { withCredentials: true });
  }

  getMe(): Observable<AuthResponse | null> {
    return this.http
      .get<BaseResponse<AuthResponse>>('/api/auth/me', { withCredentials: true })
      .pipe(
        map((res) => {
          if (res?.ok && res?.data) return this.parseAuthPayload(res);
          return null;
        })
      );
  }
}
