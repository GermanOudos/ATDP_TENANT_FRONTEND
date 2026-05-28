import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'maskedSecret', standalone: true })
export class MaskedSecretPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return value;
  }
}
