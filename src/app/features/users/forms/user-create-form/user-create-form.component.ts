import { Component, input, output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { CreateUserRequest, createUserSchema } from '@schemas/user.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';

@Component({
  selector: 'app-user-create-form',
  standalone: true,
  imports: [ReactiveFormsModule, TuiButton, FormFieldErrorComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
          <input
            formControlName="username"
            type="email"
            placeholder="usuario@empresa.com"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.username" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
          <input
            formControlName="fullName"
            placeholder="Nombre Apellido"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.fullName" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
          <input
            type="password"
            formControlName="password"
            placeholder="Mínimo 8 caracteres"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.password" />
        </div>
        <div class="flex items-center">
          <label class="inline-flex items-center gap-2 text-sm text-slate-700 mt-5">
            <input type="checkbox" formControlName="isActive" class="rounded border-slate-300" />
            Activo
          </label>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button type="button" tuiButton appearance="outline" size="m" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="submit" tuiButton appearance="primary" size="m" [disabled]="isSubmitting()">
          {{ isSubmitting() ? 'Creando...' : 'Crear usuario' }}
        </button>
      </div>
    </form>
  `,
})
export class UserCreateFormComponent {
  readonly isSubmitting = input<boolean>(false);
  readonly created = output<CreateUserRequest>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    username: ['', [Validators.required, zodValidator(createUserSchema.shape.username)]],
    fullName: ['', [Validators.required, zodValidator(createUserSchema.shape.fullName)]],
    password: ['', [Validators.required, zodValidator(createUserSchema.shape.password)]],
    isActive: [true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.created.emit(this.form.getRawValue());
    this.form.reset({ isActive: true });
  }
}
