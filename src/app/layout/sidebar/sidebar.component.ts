import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NAV_ITEMS } from './sidebar-nav';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <lucide-icon name="layers" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-sm font-bold tracking-wide">ATDP</p>
          <p class="text-xs text-slate-400">Tenant Manager</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-slate-700 text-white"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
          >
            <lucide-icon [name]="item.icon" class="w-5 h-5 shrink-0" />
            {{ item.label }}
          </a>
        }
      </nav>

      <!-- Version -->
      <div class="px-6 py-4 border-t border-slate-700">
        <p class="text-xs text-slate-500">v1.0.0</p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  protected readonly navItems = NAV_ITEMS;
}
