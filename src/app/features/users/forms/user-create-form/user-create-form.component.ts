import { Component, output, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUserRequest, createUserSchema } from '@schemas/user.schema';
import { zodValidator } from '@shared/validators/zod-validator.util';

@Component({
  selector: 'app-user-create-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Correo</label><input formControlName="username" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label><input formControlName="fullName" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <div><label class="mb-1 block text-sm font-medium text-slate-700">Password</label><input type="password" formControlName="password" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
      <label class="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" formControlName="isActive" /> Activo</label>
      <button type="submit" class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Crear usuario</button>
    </form>
  `,
})
export class UserCreateFormComponent {
  readonly created = output<CreateUserRequest>();
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
  }
}
