import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dateFormat', standalone: true })
export class DateFormatPipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'date' | 'datetime' = 'datetime'): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';

    const options: Intl.DateTimeFormatOptions =
      format === 'date'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          };

    return new Intl.DateTimeFormat('es-CO', options).format(date);
  }
}
