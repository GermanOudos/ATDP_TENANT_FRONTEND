import { HttpParams } from '@angular/common/http';
import { PaginationParams } from '@schemas/api-response.schema';

export function buildPaginationParams(params: PaginationParams): HttpParams {
  let httpParams = new HttpParams()
    .set('page', params.page.toString())
    .set('pageSize', params.pageSize.toString());

  if (params.searchTerm?.trim()) {
    httpParams = httpParams.set('searchTerm', params.searchTerm.trim());
  }

  if (params.includeDeleted) {
    httpParams = httpParams.set('includeDeleted', 'true');
  }

  return httpParams;
}
