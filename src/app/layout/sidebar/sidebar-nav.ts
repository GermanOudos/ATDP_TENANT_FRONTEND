export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Tenants', route: '/tenants', icon: 'building-2' },
  { label: 'Usuarios', route: '/users', icon: 'users' },
  { label: 'Roles', route: '/roles', icon: 'shield-check' },
  { label: 'Menús', route: '/menus', icon: 'menu-square' },
];
