import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/http/base-api.service';
import { buildPaginationParams } from '@shared/utils/pagination.util';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import { RoleDto, CreateRoleRequest, UpdateRoleRequest } from '@schemas/role.schema';

@Injectable()
export class RolesService extends BaseApiService {
  private readonly BASE = '/api/role';

  getAll(params: PaginationParams): Observable<PaginatedResponse<RoleDto>> {
    return this.getPaginated<RoleDto>(this.BASE, buildPaginationParams(params));
  }

  getById(id: number): Observable<RoleDto> {
    return this.get<RoleDto>(`${this.BASE}/${id}`);
  }

  create(dto: CreateRoleRequest): Observable<RoleDto> {
    return this.post<RoleDto>(this.BASE, dto);
  }

  update(id: number, dto: UpdateRoleRequest): Observable<RoleDto> {
    return this.put<RoleDto>(`${this.BASE}/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return super.delete<void>(`${this.BASE}/${id}`);
  }
}
