import { Component, output, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SetApiCredentialsRequest, setApiCredentialsSchema } from '@schemas/tenant.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';

@Component({
  selector: 'app-api-credentials-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldErrorComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" autocomplete="off" class="max-w-md space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">API Username</label>
        <input
          formControlName="apiUsername"
          placeholder="usuario_api"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <app-form-field-error [control]="form.controls.apiUsername" [submitted]="formSubmitted" />
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">API Password</label>
        <input
          type="password"
          formControlName="apiPassword"
          placeholder="Mín. 12 caracteres con mayús., núm. y carácter especial"
          autocomplete="new-password"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <app-form-field-error [control]="form.controls.apiPassword" [submitted]="formSubmitted" />
      </div>

      <div class="pt-1">
        <button
          type="submit"
          [disabled]="isSubmitting()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting() ? 'Guardando...' : 'Guardar credenciales' }}
        </button>
      </div>
    </form>
  `,
})
export class ApiCredentialsFormComponent {
  readonly submitted = output<SetApiCredentialsRequest>();
  readonly isSubmitting = input<boolean>(false);
  private readonly fb = inject(NonNullableFormBuilder);
  protected formSubmitted = false;

  protected readonly form = this.fb.group({
    apiUsername: ['', [Validators.required, zodValidator(setApiCredentialsSchema.shape.apiUsername)]],
    apiPassword: ['', [Validators.required, zodValidator(setApiCredentialsSchema.shape.apiPassword)]],
  });

  protected submit(): void {
    this.formSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
    this.form.reset();
    this.formSubmitted = false;
  }
}
