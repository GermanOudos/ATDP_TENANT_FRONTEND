import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/http/base-api.service';
import { buildPaginationParams } from '@shared/utils/pagination.util';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '@schemas/user.schema';

@Injectable()
export class UsersService extends BaseApiService {
  private readonly BASE = '/api/user';

  getAll(params: PaginationParams): Observable<PaginatedResponse<UserDto>> {
    return this.getPaginated<UserDto>(this.BASE, buildPaginationParams(params));
  }

  getById(id: number): Observable<UserDto> {
    return this.get<UserDto>(`${this.BASE}/${id}`);
  }

  create(dto: CreateUserRequest): Observable<UserDto> {
    return this.post<UserDto>(this.BASE, dto);
  }

  update(id: number, dto: UpdateUserRequest): Observable<UserDto> {
    return this.put<UserDto>(`${this.BASE}/${id}`, dto);
  }

  toggleActive(id: number, isActive: boolean): Observable<UserDto> {
    return this.put<UserDto>(`${this.BASE}/${id}`, { isActive });
  }

  remove(id: number): Observable<void> {
    return super.delete<void>(`${this.BASE}/${id}`);
  }
}
