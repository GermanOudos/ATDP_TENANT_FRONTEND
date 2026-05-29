import { Component, input, output, inject, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TuiButton } from '@taiga-ui/core';
import { UpdateUserRequest, UserDto, updateUserSchema } from '@schemas/user.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { FormFieldErrorComponent } from '@shared/components/form-field-error/form-field-error.component';

@Component({
  selector: 'app-user-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, TuiButton, FormFieldErrorComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <p class="text-sm font-medium text-slate-700">Editar usuario: <span class="text-slate-500">{{ user()?.username }}</span></p>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
          <input
            formControlName="username"
            type="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.username" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
          <input
            formControlName="fullName"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <app-form-field-error [control]="form.controls.fullName" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Nueva contraseña <span class="text-slate-400">(opcional)</span></label>
          <input
            type="password"
            formControlName="password"
            placeholder="Dejar vacío para no cambiar"
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
          {{ isSubmitting() ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>
    </form>
  `,
})
export class UserEditFormComponent {
  readonly user = input<UserDto | null>(null);
  readonly isSubmitting = input<boolean>(false);
  readonly saved = output<UpdateUserRequest>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    username: ['', [zodValidator(updateUserSchema.shape.username)]],
    fullName: ['', [zodValidator(updateUserSchema.shape.fullName)]],
    password: [''],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (!user) return;
      this.form.patchValue({
        username: user.username,
        fullName: user.fullName ?? '',
        isActive: user.isActive,
        password: '',
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    // Omit password if blank
    const dto: UpdateUserRequest = {
      username: raw.username || undefined,
      fullName: raw.fullName || undefined,
      isActive: raw.isActive,
      ...(raw.password ? { password: raw.password } : {}),
    };
    this.saved.emit(dto);
  }
}
