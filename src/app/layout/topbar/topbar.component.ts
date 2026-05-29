import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
      <div></div>

      <div class="flex items-center gap-4">
        <!-- User info -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-medium text-slate-900">{{ authStore.displayName() }}</p>
            <p class="text-xs text-slate-500">Administrador</p>
          </div>
          <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <lucide-icon name="user" class="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <!-- Logout -->
        <button
          (click)="logout()"
          class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <lucide-icon name="log-out" class="w-4 h-4" />
          <span class="sr-only">Cerrar sesión</span>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  protected readonly authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout(undefined);
  }
}
