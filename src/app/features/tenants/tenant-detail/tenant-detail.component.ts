import { Component, OnInit, inject, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { TuiTabs } from '@taiga-ui/kit';
import { TenantsStore } from '../tenants.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { MaskedSecretPipe } from '@shared/pipes/masked-secret.pipe';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { TenantDto, UpdateTenantRequest, SetApiCredentialsRequest, GenerateSecretRequest, RevokeSecretRequest, SetTsaConfigRequest } from '@schemas/tenant.schema';
import { TenantEditFormComponent } from '../forms/tenant-edit-form/tenant-edit-form.component';
import { ApiCredentialsFormComponent } from '../forms/api-credentials-form/api-credentials-form.component';
import { TenantSecretFormComponent } from '../forms/tenant-secret-form/tenant-secret-form.component';
import { TsaConfigFormComponent } from '../forms/tsa-config-form/tsa-config-form.component';

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    RouterLink,
    LucideAngularModule,
    TuiButton,
    TuiTabs,
    PageHeaderComponent,
    StatusBadgeComponent,
    MaskedSecretPipe,
    TenantEditFormComponent,
    ApiCredentialsFormComponent,
    TenantSecretFormComponent,
    TsaConfigFormComponent,
  ],
  template: `
    @if (store.selectedTenant(); as tenant) {
      <app-page-header [title]="tenant.businessName" [subtitle]="tenant.identificationNumber">
        <app-status-badge [status]="getStatus(tenant)" />
        <a tuiButton appearance="outline" size="m" routerLink="/tenants">
          <lucide-icon name="arrow-left" class="w-4 h-4 mr-1" />
          Volver
        </a>
        @if (!tenant.isDeleted) {
          @if (tenant.isActive) {
            <button tuiButton appearance="outline" size="m" (click)="onToggleActive(tenant, false)"
              style="color:#d97706; border-color:#d97706;">
              <lucide-icon name="ban" class="w-4 h-4 mr-1" />
              Inhabilitar
            </button>
          } @else {
            <button tuiButton appearance="outline" size="m" (click)="onToggleActive(tenant, true)"
              style="color:#16a34a; border-color:#16a34a;">
              <lucide-icon name="circle-check" class="w-4 h-4 mr-1" />
              Habilitar
            </button>
          }
        }
        <button tuiButton appearance="outline" size="m" (click)="onDeleteTenant(tenant)"
          style="color:#dc2626; border-color:#dc2626;">
          <lucide-icon name="trash-2" class="w-4 h-4 mr-1" />
          Eliminar
        </button>
      </app-page-header>

      <!-- Banner inhabilitado -->
      @if (!tenant.isActive && !tenant.isDeleted) {
        <div class="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <lucide-icon name="ban" class="w-4 h-4 shrink-0 text-amber-600" />
          <p class="text-sm text-amber-700">
            Este tenant está <strong>inhabilitado</strong>. Solo puedes editar su información general.
            Para usar las demás funciones, habilítalo primero.
          </p>
        </div>
      }

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <!-- Tabs -->
        <div class="border-b border-slate-200 px-6" style="--t-color: #3b82f6; --tui-primary: #3b82f6; --tui-background-accent-1: #3b82f6;">
          <tui-tabs [(activeItemIndex)]="activeTab">
            <button tuiTab class="!px-4 !py-4 !text-sm">Información general</button>
            <button tuiTab class="!px-4 !py-4 !text-sm" [disabled]="!tenant.isActive">Credenciales API</button>
            <button tuiTab class="!px-4 !py-4 !text-sm" [disabled]="!tenant.isActive">Secreto</button>
            <button tuiTab class="!px-4 !py-4 !text-sm" [disabled]="!tenant.isActive">Configuración TSA</button>
          </tui-tabs>
        </div>

        <div class="p-6">
          @switch (activeTab) {
            @case (0) {
              <app-tenant-edit-form
                [tenant]="tenant"
                [isSubmitting]="store.isSubmitting()"
                [serverError]="store.serverErrors().length ? store.serverErrors()[0] : null"
                (saved)="onUpdateTenant(tenant.id, $event)"
              />
            }
            @case (1) {
              <app-api-credentials-form
                [isSubmitting]="store.isSubmitting()"
                (submitted)="onSetApiCredentials(tenant.id, $event)"
              />
            }
            @case (2) {
              <div class="space-y-4">
                <!-- Estado del secreto — 100% -->
                @if (tenant.tenantSecretIsActive && tenant.tenantSecretMasked) {
                  <div class="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                    <div>
                      <p class="text-xs font-medium text-green-600 uppercase tracking-wide mb-0.5">Secreto activo</p>
                      <p class="font-mono text-sm text-slate-700">{{ tenant.tenantSecretMasked | maskedSecret }}</p>
                    </div>
                    <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Activo</span>
                  </div>
                } @else if (tenant.tenantSecretMasked) {
                  <div class="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                    <div>
                      <p class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Último secreto (inactivo)</p>
                      <p class="font-mono text-sm text-slate-400">{{ tenant.tenantSecretMasked | maskedSecret }}</p>
                    </div>
                    <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Inactivo</span>
                  </div>
                } @else {
                  <div class="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                    <p class="text-xs font-medium text-slate-400 uppercase tracking-wide">Sin secreto generado</p>
                  </div>
                }
                <!-- Acciones — 50/50 -->
                <app-tenant-secret-form
                  [tenant]="tenant"
                  [isSubmitting]="store.isSubmitting()"
                  (generated)="onGenerateSecret(tenant.id, $event)"
                  (revoked)="onRevokeSecret(tenant.id, $event)"
                />
              </div>
            }
            @case (3) {
              <app-tsa-config-form
                [tenant]="tenant"
                [isSubmitting]="store.isSubmitting()"
                (saved)="onSetTsaConfig(tenant.id, $event)"
              />
            }
          }
        </div>
      </div>
    } @else if (store.isLoading()) {
      <div class="flex items-center justify-center py-32">
        <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }
  `,
})
export class TenantDetailComponent implements OnInit {
  protected readonly store = inject(TenantsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected activeTab = 0;

  constructor() {
    effect(() => {
      const tenant = this.store.selectedTenant();
      if (tenant?.isDeleted) {
        this.router.navigate(['/tenants']);
      }
      // Si el tenant se inhabilita y estamos en un tab restringido, volver al tab 0
      if (tenant && !tenant.isActive && this.activeTab > 0) {
        this.activeTab = 0;
      }
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.store.loadById(id);
  }

  getStatus(tenant: TenantDto): 'active' | 'inactive' | 'deleted' {
    if (tenant.isDeleted) return 'deleted';
    if (!tenant.isActive) return 'inactive';
    return 'active';
  }

  onUpdateTenant(id: number, dto: UpdateTenantRequest): void {
    this.store.updateTenant({ id, dto });
  }

  onSetApiCredentials(id: number, dto: SetApiCredentialsRequest): void {
    this.store.setApiCredentials({ id, dto });
  }

  onGenerateSecret(id: number, dto: GenerateSecretRequest): void {
    this.store.generateSecret({ id, dto });
  }

  onRevokeSecret(id: number, dto: RevokeSecretRequest): void {
    this.store.revokeSecret({ id, dto });
  }

  onSetTsaConfig(id: number, dto: SetTsaConfigRequest): void {
    this.store.setTsaConfig({ id, dto });
  }

  onToggleActive(tenant: TenantDto, activate: boolean): void {
    const action = activate ? 'habilitar' : 'inhabilitar';
    this.confirmDialog
      .confirm({
        title: activate ? 'Habilitar tenant' : 'Inhabilitar tenant',
        message: `¿Deseas ${action} a ${tenant.businessName}?`,
      })
      .subscribe((accepted) => {
        if (!accepted) return;
        this.store.toggleActive({ id: tenant.id, activate });
      });
  }

  onDeleteTenant(tenant: TenantDto): void {
    this.confirmDialog
      .confirm({
        title: 'Eliminar tenant',
        message: `Se eliminará ${tenant.businessName}. Esta acción no se puede deshacer.`,
      })
      .subscribe((accepted) => {
        if (!accepted) return;
        this.store.deleteTenant(tenant.id);
      });
  }
}
