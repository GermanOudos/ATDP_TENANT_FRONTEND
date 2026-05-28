import { Routes } from '@angular/router';
import { MenusStore } from './menus.store';
import { MenusService } from './menus.service';

export const MENUS_ROUTES: Routes = [
  {
    path: '',
    providers: [MenusStore, MenusService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./menu-list/menu-list.component').then((m) => m.MenuListComponent),
      },
    ],
  },
];
