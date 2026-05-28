import { Routes } from '@angular/router';
import { UsersStore } from './users.store';
import { UsersService } from './users.service';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [UsersStore, UsersService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-list/user-list.component').then((m) => m.UserListComponent),
      },
    ],
  },
];
