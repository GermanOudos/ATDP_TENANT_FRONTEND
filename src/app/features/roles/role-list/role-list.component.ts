import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { RolesStore } from '../roles.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { RoleDto } from '@schemas/role.schema';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [LucideAngularModule, TuiButton, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent, DateFormatPipe],
  template: `
    <app-page-header title="Roles" subtitle="Gestión de roles y permisos">
      <button tuiButton appearance="primary" size="m">
        <lucide-icon name="plus" class="w-4 h-4 mr-1" />
        Nuevo rol
      </button>
    </app-page-header>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      @if (store.isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (store.items().length === 0) {
        <app-empty-state message="No se encontraron roles" />
      } @else {
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Creado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (role of store.items(); track role.idRole) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-900">{{ role.roleName }}</td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="role.isActive ? 'active' : 'inactive'" />
                </td>
                <td class="px-4 py-3 text-slate-500">{{ role.createdAt | dateFormat:'date' }}</td>
                <td class="px-4 py-3 flex gap-2">
                  <button tuiButton appearance="flat" size="xs">
                    <lucide-icon name="pencil" class="w-3.5 h-3.5" />
                  </button>
                  <button tuiButton appearance="destructive" size="xs" (click)="store.deleteRole(role.idRole)">
                    <lucide-icon name="trash-2" class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class RoleListComponent implements OnInit {
  protected readonly store = inject(RolesStore);

  ngOnInit(): void {
    this.store.loadAll(this.store.paginationParams());
  }
}
