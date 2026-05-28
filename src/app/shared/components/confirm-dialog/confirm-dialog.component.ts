import { Component, output, input } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ title() }}</h3>
      <p class="mt-2 text-sm text-slate-600">{{ message() }}</p>
      <div class="mt-4 flex items-center justify-end gap-2">
        <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" (click)="cancel.emit()">
          Cancelar
        </button>
        <button type="button" class="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white" (click)="confirm.emit()">
          Confirmar
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly title = input<string>('Confirmar accion');
  readonly message = input.required<string>();
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
