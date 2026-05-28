import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseResponse } from '@schemas/api-response.schema';
import { ValidationRules, validationRulesSchema } from '@schemas/metadata.schema';

@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly http = inject(HttpClient);

  getValidationRules(): Observable<ValidationRules> {
    return this.http
      .get<BaseResponse<unknown>>('/api/metadata/validation-rules')
      .pipe(map((res) => validationRulesSchema.parse(res.data)));
  }
}
