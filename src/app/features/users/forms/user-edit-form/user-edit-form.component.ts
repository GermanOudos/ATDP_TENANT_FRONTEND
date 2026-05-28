import { Component, input, output, inject, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UpdateUserRequest, UserDto, updateUserSchema } from '@schemas/user.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';

@Component({
  selector: 'app-user-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Correo</label><input formControlName="username" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label><input formControlName="fullName" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Password (opcional)</label><input type="password" formControlName="password" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <label class="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" formControlName="isActive" /> Activo</label>
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Guardar usuario</button>
    </form>
  `,
})
export class UserEditFormComponent {
  readonly user = input<UserDto | null>(null);
  readonly saved = output<UpdateUserRequest>();
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
        fullName: user.fullName,
        isActive: user.isActive,
      });
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.form.getRawValue());
  }
}
