import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton, TuiError, TuiLabel } from '@taiga-ui/core';
import { AuthStore } from '@core/auth/auth.store';
import { zodValidator } from '@shared/validators/zod-validator.util';
import { loginRequestSchema } from '@schemas/auth.schema';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    TuiButton,
    TuiError,
    TuiLabel,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div class="w-full max-w-md">
        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <!-- Header -->
          <div class="flex flex-col items-center mb-8">
            <div class="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <lucide-icon name="layers" class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-2xl font-bold text-slate-900">ATDP Tenant</h1>
            <p class="text-sm text-slate-500 mt-1">Panel de administración</p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label tuiLabel class="block text-sm font-medium text-slate-700 mb-1">
                Usuario
              </label>
              <input
                formControlName="username"
                type="text"
                placeholder="admin@empresa.com"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              @if (form.controls.username.invalid && form.controls.username.touched) {
                <p class="mt-1 text-xs text-red-600">
                  {{ form.controls.username.errors?.['zodError'] ?? 'Campo requerido' }}
                </p>
              }
            </div>

            <div>
              <label tuiLabel class="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                formControlName="password"
                type="password"
                placeholder="••••••••"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              @if (form.controls.password.invalid && form.controls.password.touched) {
                <p class="mt-1 text-xs text-red-600">
                  {{ form.controls.password.errors?.['zodError'] ?? 'Campo requerido' }}
                </p>
              }
            </div>

            <button
              tuiButton
              type="submit"
              appearance="primary"
              class="w-full mt-2"
              [disabled]="authStore.isLoading()"
            >
              @if (authStore.isLoading()) {
                <lucide-icon name="loader-2" class="w-4 h-4 animate-spin mr-2" />
                Ingresando...
              } @else {
                Iniciar sesión
              }
            </button>

            @if (authStore.errorMessage()) {
              <p class="mt-2 text-center text-xs text-red-600">{{ authStore.errorMessage() }}</p>
            }
          </form>
        </div>

        <p class="text-center text-xs text-slate-500 mt-6">
          ATDP &copy; {{ currentYear }} — Sistema Multitenant
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly currentYear = new Date().getFullYear();

  protected readonly form = this.fb.group({
    username: [
      '',
      [Validators.required, zodValidator(loginRequestSchema.shape.username)],
    ],
    password: [
      '',
      [Validators.required, zodValidator(loginRequestSchema.shape.password)],
    ],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authStore.login(this.form.getRawValue());
  }
}
