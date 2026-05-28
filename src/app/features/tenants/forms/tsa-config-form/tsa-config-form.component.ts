import { Component, output, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TenantDto, SetTsaConfigRequest, setTsaConfigSchema } from '@schemas/tenant.schema';
import { zodValidator, zodGroupValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tsa-config-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldErrorComponent, LucideAngularModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" autocomplete="off" class="space-y-6">

      <!-- TSA Principal -->
      <div class="rounded-xl border border-slate-200 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-semibold text-slate-700">TSA Principal</h4>
            <p class="text-xs text-slate-400 mt-0.5">Todos los campos son opcionales</p>
          </div>
          @if (tenant()) {
            <div class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
              {{ tenant()!.tsaPrincipalConfigured
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700' }}">
              <lucide-icon [name]="tenant()!.tsaPrincipalConfigured ? 'check-circle' : 'clock'" class="w-3 h-3" />
              {{ tenant()!.tsaPrincipalConfigured ? 'Asignada' : 'Pendiente' }}
            </div>
          }
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">URL</label>
            <input
              formControlName="tsaPrincipalUrl"
              placeholder="https://tsa.ejemplo.com/timestamp"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <app-form-field-error [control]="form.controls.tsaPrincipalUrl" [submitted]="submitted" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
            <input
              formControlName="tsaPrincipalUsername"
              placeholder="usuario_tsa"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              formControlName="tsaPrincipalPassword"
              placeholder="Contraseña TSA principal"
              autocomplete="new-password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- TSA Contingencia -->
      <div class="rounded-xl border border-slate-200 p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-semibold text-slate-700">TSA Contingencia</h4>
            <p class="text-xs text-slate-400 mt-0.5">Todos los campos son opcionales</p>
          </div>
          @if (tenant()) {
            <div class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium
              {{ tenant()!.tsaContingencyConfigured
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700' }}">
              <lucide-icon [name]="tenant()!.tsaContingencyConfigured ? 'check-circle' : 'clock'" class="w-3 h-3" />
              {{ tenant()!.tsaContingencyConfigured ? 'Asignada' : 'Pendiente' }}
            </div>
          }
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="md:col-span-2">
            <label class="mb-1 block text-sm font-medium text-slate-700">URL</label>
            <input
              formControlName="tsaContingencyUrl"
              placeholder="https://tsa-backup.ejemplo.com/timestamp"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <app-form-field-error [control]="form.controls.tsaContingencyUrl" [submitted]="submitted" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Usuario</label>
            <input
              formControlName="tsaContingencyUsername"
              placeholder="usuario_tsa_backup"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              formControlName="tsaContingencyPassword"
              placeholder="Contraseña TSA contingencia"
              autocomplete="new-password"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <!-- Error validación cruzada: misma URL -->
        @if (form.errors?.['zodGroupError'] && submitted) {
          <p class="text-xs text-red-600">{{ form.errors?.['zodGroupError'] }}</p>
        }
      </div>

      <div class="flex items-center gap-3">
        <button
          type="submit"
          [disabled]="isSubmitting()"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting() ? 'Guardando...' : 'Guardar TSA' }}
        </button>
      </div>
    </form>
  `,
})
export class TsaConfigFormComponent {
  readonly saved = output<SetTsaConfigRequest>();
  readonly isSubmitting = input<boolean>(false);
  readonly tenant = input<TenantDto | null>(null);
  private readonly fb = inject(NonNullableFormBuilder);
  protected submitted = false;

  protected readonly form = this.fb.group(
    {
      tsaPrincipalUrl: ['', [zodValidator(setTsaConfigSchema.shape.tsaPrincipalUrl)]],
      tsaPrincipalUsername: [''],
      tsaPrincipalPassword: [''],
      tsaContingencyUrl: ['', [zodValidator(setTsaConfigSchema.shape.tsaContingencyUrl)]],
      tsaContingencyUsername: [''],
      tsaContingencyPassword: [''],
    },
    { validators: zodGroupValidator(setTsaConfigSchema) }
  );

  protected submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    // El backend rechaza strings vacíos en campos nullable — convertir a undefined
    // undefined se omite al serializar a JSON, y el backend C# lo recibe como null
    const dto: SetTsaConfigRequest = {
      tsaPrincipalUrl:        raw.tsaPrincipalUrl        || undefined,
      tsaPrincipalUsername:   raw.tsaPrincipalUsername   || undefined,
      tsaPrincipalPassword:   raw.tsaPrincipalPassword   || undefined,
      tsaContingencyUrl:      raw.tsaContingencyUrl      || undefined,
      tsaContingencyUsername: raw.tsaContingencyUsername || undefined,
      tsaContingencyPassword: raw.tsaContingencyPassword || undefined,
    };
    this.saved.emit(dto);
    this.form.reset();
    this.submitted = false;
  }
}
