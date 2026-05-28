import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    const text = options.title ? `${options.title}\n\n${options.message}` : options.message;
    return of(window.confirm(text));
  }
}
