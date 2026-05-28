import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { UsersStore } from '../users.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { UserCreateFormComponent } from '../forms/user-create-form/user-create-form.component';
import { UserEditFormComponent } from '../forms/user-edit-form/user-edit-form.component';
import { UserDto, CreateUserRequest, UpdateUserRequest } from '@schemas/user.schema';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    LucideAngularModule,
    TuiButton,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    DateFormatPipe,
    UserCreateFormComponent,
    UserEditFormComponent,
  ],
  template: `
    <app-page-header title="Usuarios" subtitle="Administradores del sistema">
      <button tuiButton appearance="primary" size="m" (click)="showCreateForm = !showCreateForm">
        <lucide-icon name="plus" class="w-4 h-4 mr-1" />
        {{ showCreateForm ? 'Cerrar formulario' : 'Nuevo usuario' }}
      </button>
    </app-page-header>

    @if (showCreateForm) {
      <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <app-user-create-form (created)="onCreateUser($event)" />
      </div>
    }

    @if (editingUser) {
      <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <app-user-edit-form [user]="editingUser" (saved)="onUpdateUser(editingUser.id, $event)" />
      </div>
    }

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      @if (store.isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (store.items().length === 0) {
        <app-empty-state message="No se encontraron usuarios" />
      } @else {
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Usuario</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
              <th class="text-left px-4 py-3 font-medium text-slate-600">Creado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (user of store.items(); track user.id) {
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium text-slate-900">{{ user.fullName }}</td>
                <td class="px-4 py-3 text-slate-500">{{ user.username }}</td>
                <td class="px-4 py-3">
                  <app-status-badge [status]="getStatus(user)" />
                </td>
                <td class="px-4 py-3 text-slate-500">{{ user.createdAt | dateFormat:'date' }}</td>
                <td class="px-4 py-3 flex items-center gap-2">
                  <button tuiButton appearance="flat" size="xs" (click)="editingUser = user">
                    <lucide-icon name="pencil" class="w-3.5 h-3.5" />
                  </button>
                  <button tuiButton appearance="flat" size="xs" (click)="onDeleteUser(user)">
                    <lucide-icon name="trash-2" class="w-3.5 h-3.5 text-red-600" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <p class="text-xs text-slate-500">{{ store.pagination().totalRecords }} usuarios en total</p>
          <div class="flex items-center gap-2">
            <button tuiButton appearance="outline" size="xs" [disabled]="!store.hasPreviousPage()" (click)="store.setPage(store.pagination().page - 1)">
              <lucide-icon name="chevron-left" class="w-4 h-4" />
            </button>
            <span class="text-xs text-slate-600">Página {{ store.pagination().page }} de {{ store.pagination().totalPages }}</span>
            <button tuiButton appearance="outline" size="xs" [disabled]="!store.hasNextPage()" (click)="store.setPage(store.pagination().page + 1)">
              <lucide-icon name="chevron-right" class="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected showCreateForm = false;
  protected editingUser: UserDto | null = null;

  ngOnInit(): void {
    this.store.loadAll(this.store.paginationParams());
  }

  getStatus(user: UserDto): 'active' | 'inactive' | 'deleted' {
    if (user.isDeleted) return 'deleted';
    if (!user.isActive) return 'inactive';
    return 'active';
  }

  onCreateUser(dto: CreateUserRequest): void {
    this.store.createUser(dto);
    this.showCreateForm = false;
  }

  onUpdateUser(id: number, dto: UpdateUserRequest): void {
    this.store.updateUser({ id, dto });
    this.editingUser = null;
  }

  onDeleteUser(user: UserDto): void {
    this.confirmDialog
      .confirm({
        title: 'Eliminar usuario',
        message: `Se eliminara ${user.fullName}. Esta accion no se puede deshacer.`,
      })
      .subscribe((accepted) => {
        if (!accepted) return;
        this.store.deleteUser(user.id);
      });
  }
}
