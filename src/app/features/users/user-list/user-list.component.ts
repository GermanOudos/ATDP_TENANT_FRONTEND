import { Component, inject, OnInit, effect } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { UsersStore } from '../users.store';
import { AuthStore } from '@core/auth/auth.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { DateFormatPipe } from '@shared/pipes/date-format.pipe';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
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
    DateFormatPipe,
    PaginatedTableComponent,
    UserCreateFormComponent,
    UserEditFormComponent,
  ],
  template: `
    <app-page-header title="Usuarios" subtitle="Administradores del sistema">
      @if (!editingUser) {
        <button tuiButton appearance="primary" size="m" (click)="openCreate()">
          <lucide-icon name="plus" class="w-4 h-4 mr-1" />
          {{ showCreateForm ? 'Cerrar formulario' : 'Nuevo usuario' }}
        </button>
      }
    </app-page-header>

    @if (showCreateForm) {
      <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <app-user-create-form
          [isSubmitting]="store.isSubmitting()"
          (created)="onCreateUser($event)"
          (cancelled)="closeForm()"
        />
      </div>
    }

    @if (editingUser) {
      <div class="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <app-user-edit-form
          [user]="editingUser"
          [isSubmitting]="store.isSubmitting()"
          (saved)="onUpdateUser(editingUser.id, $event)"
          (cancelled)="closeForm()"
        />
      </div>
    }

    <app-paginated-table
      [isLoading]="store.isLoading()"
      [isEmpty]="store.items().length === 0"
      [totalRecords]="store.pagination().totalRecords"
      [page]="store.pagination().page"
      [pageSize]="store.pagination().pageSize"
      [totalPages]="store.pagination().totalPages"
      [hasPreviousPage]="store.hasPreviousPage()"
      [hasNextPage]="store.hasNextPage()"
      searchPlaceholder="Buscar usuario..."
      emptyMessage="No se encontraron usuarios"
      entityLabel="usuarios"
      (search)="onSearch($event)"
      (pageSizeChange)="onPageSizeChange($event)"
      (pageChange)="onPageChange($event)"
    >
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
          <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ user.fullName }}
              @if (isCurrentUser(user)) {
                <span class="ml-2 text-xs text-slate-400">(tú)</span>
              }
            </td>
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ user.username }}</td>
            <td class="px-4 py-3">
              <app-status-badge [status]="getStatus(user)" />
            </td>
            <td class="px-4 py-3 text-slate-500">{{ user.createdAt | dateFormat:'date' }}</td>
            <td class="px-4 py-3">
              @if (!isCurrentUser(user)) {
                <div class="flex items-center gap-1">
                  <button tuiButton appearance="flat" size="xs" title="Editar" (click)="openEdit(user)">
                    <lucide-icon name="pencil" class="w-3.5 h-3.5" />
                  </button>
                  <button
                    tuiButton appearance="flat" size="xs"
                    [title]="user.isActive ? 'Inhabilitar' : 'Habilitar'"
                    (click)="onToggleActive(user)"
                  >
                    <lucide-icon
                      [name]="user.isActive ? 'ban' : 'circle-check'"
                      [class]="user.isActive ? 'w-3.5 h-3.5 text-amber-500' : 'w-3.5 h-3.5 text-green-500'"
                    />
                  </button>
                  <button tuiButton appearance="flat" size="xs" title="Eliminar" (click)="onDeleteUser(user)">
                    <lucide-icon name="trash-2" class="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              }
            </td>
          </tr>
        }
      </tbody>
    </app-paginated-table>
  `,
})
export class UserListComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  private readonly authStore = inject(AuthStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected showCreateForm = false;
  protected editingUser: UserDto | null = null;
  private wasSubmitting = false;

  constructor() {
    effect(() => {
      const isSubmitting = this.store.isSubmitting();
      if (this.wasSubmitting && !isSubmitting) {
        this.showCreateForm = false;
        this.editingUser = null;
      }
      this.wasSubmitting = isSubmitting;
    });
  }

  ngOnInit(): void {
    this.store.loadAll(this.store.paginationParams());
  }

  protected isCurrentUser(user: UserDto): boolean {
    return user.username === this.authStore.currentUser()?.username;
  }

  protected openCreate(): void {
    this.showCreateForm = !this.showCreateForm;
    this.editingUser = null;
  }

  protected openEdit(user: UserDto): void {
    this.editingUser = user;
    this.showCreateForm = false;
  }

  protected closeForm(): void {
    this.showCreateForm = false;
    this.editingUser = null;
  }

  onSearch(term: string): void {
    this.store.setSearch(term);
    this.store.loadAll(this.store.paginationParams());
  }

  onPageSizeChange(size: number): void {
    this.store.setPageSize(size);
    this.store.loadAll(this.store.paginationParams());
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadAll(this.store.paginationParams());
  }

  getStatus(user: UserDto): 'active' | 'inactive' | 'deleted' {
    if (user.isDeleted) return 'deleted';
    if (!user.isActive) return 'inactive';
    return 'active';
  }

  onCreateUser(dto: CreateUserRequest): void {
    const createdBy = this.authStore.currentUser()?.username ?? 'system';
    this.store.createUser({ ...dto, createdBy });
  }

  onUpdateUser(id: number, dto: UpdateUserRequest): void {
    this.store.updateUser({ id, dto });
  }

  onToggleActive(user: UserDto): void {
    const action = user.isActive ? 'inhabilitar' : 'habilitar';
    this.confirmDialog
      .confirm({
        title: `${user.isActive ? 'Inhabilitar' : 'Habilitar'} usuario`,
        message: `¿Desea ${action} a ${user.fullName ?? user.username}?`,
      })
      .subscribe((accepted) => {
        if (!accepted) return;
        this.store.toggleActive({ id: user.id, isActive: !user.isActive });
      });
  }

  onDeleteUser(user: UserDto): void {
    this.confirmDialog
      .confirm({
        title: 'Eliminar usuario',
        message: `¿Eliminar a ${user.fullName ?? user.username}? Esta acción no se puede deshacer.`,
      })
      .subscribe((accepted) => {
        if (!accepted) return;
        this.store.deleteUser(user.id);
      });
  }
}
