import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  template: `
    @if (shouldShowError()) {
      <p class="mt-1 text-xs text-red-600">{{ errorMessage() }}</p>
    }
  `,
})
export class FormFieldErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly submitted = input<boolean>(false);

  protected shouldShowError(): boolean {
    const ctrl = this.control();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected errorMessage(): string {
    const ctrl = this.control();
    if (!ctrl || !ctrl.errors) return '';

    if (ctrl.errors['zodError']) return String(ctrl.errors['zodError']);
    if (ctrl.errors['required']) return 'Campo requerido';
    if (ctrl.errors['email']) return 'Correo invalido';
    if (ctrl.errors['minlength']) return 'Valor demasiado corto';
    if (ctrl.errors['maxlength']) return 'Valor demasiado largo';

    return 'Valor invalido';
  }
}
