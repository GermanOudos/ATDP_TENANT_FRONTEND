import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardStore } from './dashboard.store';
import { StatCardComponent } from './widgets/stat-card/stat-card.component';
// import { TenantsByStatusChartComponent } from './widgets/tenants-by-status-chart/tenants-by-status-chart.component';
// import { TenantsGrowthChartComponent } from './widgets/tenants-growth-chart/tenants-growth-chart.component';
// import { TsaConfigStatusChartComponent } from './widgets/tsa-config-status-chart/tsa-config-status-chart.component';
// import { RecentTenantsListComponent } from './widgets/recent-tenants-list/recent-tenants-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    LucideAngularModule,
    StatCardComponent,
    // TenantsByStatusChartComponent,
    // TenantsGrowthChartComponent,
    // TsaConfigStatusChartComponent,
    // RecentTenantsListComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p class="text-sm text-slate-500 mt-0.5">Resumen del sistema multitenant</p>
        </div>
        <button
          (click)="store.loadData(undefined)"
          class="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <lucide-icon name="refresh-cw" class="w-4 h-4" />
          Actualizar
        </button>
      </div>

      @if (store.isLoading()) {
        <div class="flex items-center justify-center py-24">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <!-- Stat Cards — fila 1: estados -->
        <div class="grid grid-cols-4 gap-4">
          <app-stat-card title="Total" [value]="store.totalTenants()" subtitle="registrados en el sistema" icon="building-2" tone="blue" />
          <app-stat-card title="Activos" [value]="store.activeTenants()" subtitle="habilitados y operativos" icon="check-circle" tone="green" />
          <app-stat-card title="Inactivos" [value]="store.inactiveTenants()" subtitle="inhabilitados temporalmente" icon="pause-circle" tone="amber" />
          <app-stat-card title="Eliminados" [value]="store.deletedTenants()" subtitle="eliminados del sistema" icon="trash-2" tone="red" />
        </div>

        <!-- Stat Cards — fila 2: configuración -->
        <div class="grid grid-cols-2 gap-4">
          <app-stat-card title="Credenciales API configuradas" [value]="store.tenantsWithApiCredentials()" subtitle="tenants con usuario y contraseña API asignados" icon="key-round" tone="purple" />
          <app-stat-card title="Secreto activo" [value]="store.tenantsWithActiveSecret()" subtitle="tenants con secreto de autenticación vigente" icon="shield-check" tone="blue" />
        </div>

        <!-- Charts Row — pendiente de activar -->
        <!-- <div class="grid grid-cols-2 gap-4">
          <app-tenants-by-status-chart [series]="store.tenantsByStatus()" />
          <app-tenants-growth-chart [categories]="growthCategories()" [data]="growthData()" />
        </div> -->

        <!-- Bottom Row — pendiente de activar -->
        <!-- <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <app-tsa-config-status-chart [series]="tsaSeries()" />
          </div>
          <app-recent-tenants-list [tenants]="store.recentTenants()" />
        </div> -->
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  protected readonly store = inject(DashboardStore);

  ngOnInit(): void {
    this.store.loadData(undefined);
  }

  // growthData() {
  //   return this.store.tenantsByMonth().map((m) => m.count);
  // }

  // growthCategories() {
  //   return this.store.tenantsByMonth().map((m) => {
  //     const [year, month] = m.month.split('-');
  //     return new Date(+year, +month - 1).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  //   });
  // }

  // tsaSeries() {
  //   const total = this.store.totalTenants();
  //   return [
  //     { name: 'Configurado', data: [this.store.tenantsWithTsaPrincipal(), this.store.tenantsWithTsaContingency()] },
  //     { name: 'Sin configurar', data: [total - this.store.tenantsWithTsaPrincipal(), total - this.store.tenantsWithTsaContingency()] },
  //   ];
  // }
}
