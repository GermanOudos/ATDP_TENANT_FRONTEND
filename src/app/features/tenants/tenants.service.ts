import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '@core/http/base-api.service';
import { buildPaginationParams } from '@shared/utils/pagination.util';
import { PaginatedResponse, PaginationParams } from '@schemas/api-response.schema';
import {
  TenantDto,
  CreateTenantRequest,
  UpdateTenantRequest,
  SetApiCredentialsRequest,
  GenerateSecretRequest,
  RevokeSecretRequest,
  SetTsaConfigRequest,
  TsaConfigStatus,
} from '@schemas/tenant.schema';

@Injectable()
export class TenantsService extends BaseApiService {
  private readonly BASE = '/api/tenant';

  getAll(params: PaginationParams): Observable<PaginatedResponse<TenantDto>> {
    return this.getPaginated<TenantDto>(this.BASE, buildPaginationParams(params));
  }

  getById(id: number): Observable<TenantDto> {
    return this.get<TenantDto>(`${this.BASE}/${id}`);
  }

  getByIdentification(identification: string): Observable<TenantDto> {
    return this.get<TenantDto>(`${this.BASE}/identification/${identification}`);
  }

  create(dto: CreateTenantRequest, logo?: File): Observable<TenantDto> {
    return this.postForm<TenantDto>(this.BASE, this.buildFormData(dto, logo));
  }

  update(id: number, dto: UpdateTenantRequest, logo?: File): Observable<TenantDto> {
    return this.putForm<TenantDto>(`${this.BASE}/${id}`, this.buildFormData(dto, logo));
  }

  remove(id: number): Observable<void> {
    return super.delete<void>(`${this.BASE}/${id}`);
  }

  activate(id: number): Observable<TenantDto> {
    return this.patch<TenantDto>(`${this.BASE}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<TenantDto> {
    return this.patch<TenantDto>(`${this.BASE}/${id}/deactivate`, {});
  }

  setApiCredentials(id: number, dto: SetApiCredentialsRequest): Observable<void> {
    return this.patch<void>(`${this.BASE}/${id}/api-credentials`, dto);
  }

  generateSecret(id: number, dto: GenerateSecretRequest): Observable<{ secret: string }> {
    return this.post<{ secret: string }>(`${this.BASE}/${id}/secret`, dto);
  }

  revokeSecret(id: number, dto: RevokeSecretRequest): Observable<void> {
    return this.patch<void>(`${this.BASE}/${id}/secret/revoke`, dto);
  }

  setTsaConfig(id: number, dto: SetTsaConfigRequest): Observable<void> {
    return this.patch<void>(`${this.BASE}/${id}/tsa-config`, dto);
  }

  getTsaConfigStatus(id: number): Observable<TsaConfigStatus> {
    return this.get<TsaConfigStatus>(`${this.BASE}/${id}/tsa-config/status`);
  }

  private buildFormData(dto: object, logo?: File): FormData {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        form.append(key, String(value));
      }
    });
    if (logo) form.append('logo', logo, logo.name);
    return form;
  }
}
