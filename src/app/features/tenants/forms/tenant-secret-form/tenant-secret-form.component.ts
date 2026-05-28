import { Component, output, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantDto, GenerateSecretRequest, RevokeSecretRequest, generateSecretSchema, revokeSecretSchema } from '@schemas/tenant.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';

@Component({
  selector: 'app-tenant-secret-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldErrorComponent],
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Generar secreto -->
      <form [formGroup]="generateForm" (ngSubmit)="generate()" class="space-y-3 rounded-xl border border-slate-200 p-4">
        <h4 class="text-sm font-semibold text-slate-700">Generar secreto</h4>
        <div>
          <input
            type="password"
            formControlName="adminPassword"
            placeholder="Contraseña del administrador"
            autocomplete="new-password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <app-form-field-error [control]="generateForm.controls.adminPassword" [submitted]="generateSubmitted" />
        </div>
        <div>
          <textarea
            formControlName="customSecret"
            placeholder="Secreto personalizado (opcional, mín. 32 caracteres con mayús., minús., núm. y carácter especial)"
            rows="3"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          ></textarea>
          <app-form-field-error [control]="generateForm.controls.customSecret" [submitted]="generateSubmitted" />
        </div>
        <button
          type="submit"
          [disabled]="isSubmitting()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting() ? 'Generando...' : 'Generar' }}
        </button>
      </form>

      <!-- Desactivar secreto -->
      @if (tenant()?.tenantSecretIsActive) {
        <form [formGroup]="revokeForm" (ngSubmit)="revoke()" class="space-y-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <div>
            <h4 class="text-sm font-semibold text-red-700">Desactivar secreto</h4>
            <p class="text-xs text-red-500 mt-0.5">Invalida el secreto actual. El tenant no podrá autenticarse hasta que se genere uno nuevo.</p>
          </div>
          <div>
            <input
              type="password"
              formControlName="adminPassword"
              placeholder="Contraseña del administrador"
              autocomplete="new-password"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <app-form-field-error [control]="revokeForm.controls.adminPassword" [submitted]="revokeSubmitted" />
          </div>
          <button
            type="submit"
            [disabled]="isSubmitting()"
            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isSubmitting() ? 'Desactivando...' : 'Desactivar secreto' }}
          </button>
        </form>
      } @else {
        <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
          No hay secreto activo para desactivar.
        </div>
      }
    </div>
  `,
})
export class TenantSecretFormComponent {
  readonly generated = output<GenerateSecretRequest>();
  readonly revoked = output<RevokeSecretRequest>();
  readonly isSubmitting = input<boolean>(false);
  readonly tenant = input<TenantDto | null>(null);
  private readonly fb = inject(NonNullableFormBuilder);

  protected generateSubmitted = false;
  protected revokeSubmitted = false;

  protected readonly generateForm = this.fb.group({
    adminPassword: ['', [Validators.required, zodValidator(generateSecretSchema.shape.adminPassword)]],
    customSecret: ['', [zodValidator(generateSecretSchema.shape.customSecret)]],
  });

  protected readonly revokeForm = this.fb.group({
    adminPassword: ['', [Validators.required, zodValidator(revokeSecretSchema.shape.adminPassword)]],
  });

  protected generate(): void {
    this.generateSubmitted = true;
    if (this.generateForm.invalid) {
      this.generateForm.markAllAsTouched();
      return;
    }
    this.generated.emit(this.generateForm.getRawValue());
    this.generateForm.reset();
    this.generateSubmitted = false;
  }

  protected revoke(): void {
    this.revokeSubmitted = true;
    if (this.revokeForm.invalid) {
      this.revokeForm.markAllAsTouched();
      return;
    }
    this.revoked.emit(this.revokeForm.getRawValue());
    this.revokeForm.reset();
    this.revokeSubmitted = false;
  }
}
