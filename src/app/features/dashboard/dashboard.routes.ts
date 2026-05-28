import { Routes } from '@angular/router';
import { DashboardStore } from './dashboard.store';
import { TenantsService } from '@features/tenants/tenants.service';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [DashboardStore, TenantsService],
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
  },
];
