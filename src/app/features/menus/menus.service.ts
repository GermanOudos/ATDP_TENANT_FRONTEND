import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/http/base-api.service';
import { buildPaginationParams } from '@shared/utils/pagination.util';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { MenuDto, CreateMenuRequest, UpdateMenuRequest } from '@schemas/menu.schema';

@Injectable()
export class MenusService extends BaseApiService {
  private readonly BASE = '/api/menu';

  getAll(params: PaginationParams): Observable<PaginatedResponse<MenuDto>> {
    return this.getPaginated<MenuDto>(this.BASE, buildPaginationParams(params));
  }

  getById(id: number): Observable<MenuDto> {
    return this.get<MenuDto>(`${this.BASE}/${id}`);
  }

  create(dto: CreateMenuRequest): Observable<MenuDto> {
    return this.post<MenuDto>(this.BASE, dto);
  }

  update(id: number, dto: UpdateMenuRequest): Observable<MenuDto> {
    return this.put<MenuDto>(`${this.BASE}/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return super.delete<void>(`${this.BASE}/${id}`);
  }
}
