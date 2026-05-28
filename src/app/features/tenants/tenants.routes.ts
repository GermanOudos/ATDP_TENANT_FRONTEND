import { Routes } from '@angular/router';
import { TenantsStore } from './tenants.store';
import { TenantsService } from './tenants.service';

export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    providers: [TenantsStore, TenantsService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./tenant-list/tenant-list.component').then((m) => m.TenantListComponent),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./tenant-detail/tenant-detail.component').then((m) => m.TenantDetailComponent),
      },
    ],
  },
];
