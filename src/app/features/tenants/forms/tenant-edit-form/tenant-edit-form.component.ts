import { Component, input, output, inject, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TenantDto, UpdateTenantRequest, updateTenantSchema } from '@schemas/tenant.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';

@Component({
  selector: 'app-tenant-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldErrorComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" autocomplete="off" class="space-y-4">
      @if (serverError()) {
        <div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ serverError() }}
        </div>
      }

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Razón social -->
        <div class="md:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">Razón social</label>
          <input
            formControlName="businessName"
            placeholder="Nombre de la organización"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.businessName" [submitted]="submitted" />
        </div>

        <!-- Servidor -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Servidor</label>
          <input
            formControlName="dbHost"
            placeholder="192.168.1.100 o localhost"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.dbHost" [submitted]="submitted" />
        </div>

        <!-- Base de datos -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Base de datos</label>
          <input
            formControlName="dbName"
            placeholder="nombre_base_datos"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.dbName" [submitted]="submitted" />
        </div>

        <!-- Usuario del motor -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Usuario del motor</label>
          <input
            formControlName="dbUser"
            placeholder="postgres, sa (SQL Server), root (MySQL)"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.dbUser" [submitted]="submitted" />
        </div>

        <!-- Contraseña del motor -->
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">
            Contraseña del motor
            <span class="ml-1 font-normal text-slate-400">— dejar vacío para no cambiar</span>
          </label>
          <input
            type="password"
            formControlName="dbPassword"
            placeholder="Nueva contraseña"
            autocomplete="new-password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- BD Operacional (opcional) -->
      <div class="border-t border-slate-200 pt-4">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          BD Operacional <span class="font-normal normal-case text-slate-400">— opcional</span>
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Servidor</label>
            <input
              formControlName="logDbHost"
              placeholder="192.168.1.100 o localhost"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <app-form-field-error [control]="form.controls.logDbHost" [submitted]="submitted" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Base de datos</label>
            <input
              formControlName="logDbName"
              placeholder="nombre_bd_logs"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <app-form-field-error [control]="form.controls.logDbName" [submitted]="submitted" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Puerto</label>
            <input
              type="number"
              formControlName="logDbPort"
              placeholder="5432"
              min="1"
              max="65535"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <app-form-field-error [control]="form.controls.logDbPort" [submitted]="submitted" />
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          [disabled]="isSubmitting()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting() ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <button
          type="button"
          (click)="cancelled.emit()"
          class="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  `,
})
export class TenantEditFormComponent {
  readonly tenant = input<TenantDto | null>(null);
  readonly saved = output<UpdateTenantRequest>();
  readonly cancelled = output<void>();
  readonly serverError = input<string | null>(null);
  readonly isSubmitting = input<boolean>(false);

  private readonly fb = inject(NonNullableFormBuilder);
  protected submitted = false;

  protected readonly form = this.fb.group({
    businessName: ['', [zodValidator(updateTenantSchema.shape.businessName)]],
    dbHost: ['', [zodValidator(updateTenantSchema.shape.dbHost)]],
    dbName: ['', [zodValidator(updateTenantSchema.shape.dbName)]],
    dbUser: ['', [zodValidator(updateTenantSchema.shape.dbUser)]],
    dbPassword: [''],
    logDbHost: [''],
    logDbName: [''],
    logDbPort: [null as number | null],
  });

  constructor() {
    effect(() => {
      const tenant = this.tenant();
      if (!tenant) return;
      this.form.patchValue({ businessName: tenant.businessName });
    });
  }

  protected submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    // Solo enviar campos con valor — los vacíos no se mandan al backend
    const dto: UpdateTenantRequest = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    this.saved.emit(dto);
  }
}
