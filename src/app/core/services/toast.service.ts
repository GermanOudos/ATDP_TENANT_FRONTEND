import { Injectable, inject } from '@angular/core';
import { TuiNotificationService } from '@taiga-ui/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly alerts = inject(TuiNotificationService);
  private readonly position = { block: 'end' as const, inline: 'end' as const };

  success(message: string, label = 'Éxito'): void {
    this.alerts
      .open(message, { label, appearance: 'positive', autoClose: 4000, ...this.position })
      .subscribe();
  }

  error(message: string, label = 'Error'): void {
    this.alerts
      .open(message, { label, appearance: 'negative', autoClose: 6000, ...this.position })
      .subscribe();
  }

  warning(message: string, label = 'Advertencia'): void {
    this.alerts
      .open(message, { label, appearance: 'warning', autoClose: 5000, ...this.position })
      .subscribe();
  }

  info(message: string, label = 'Información'): void {
    this.alerts
      .open(message, { label, appearance: 'info', autoClose: 4000, ...this.position })
      .subscribe();
  }
}
