import { Routes } from '@angular/router';
import { RolesStore } from './roles.store';
import { RolesService } from './roles.service';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    providers: [RolesStore, RolesService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./role-list/role-list.component').then((m) => m.RoleListComponent),
      },
    ],
  },
];
