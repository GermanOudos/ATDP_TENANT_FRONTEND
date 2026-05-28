import { Component, inject, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TuiButton } from '@taiga-ui/core';
import { MenusStore } from '../menus.store';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { MenuTreeNode } from '@schemas/menu.schema';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [NgTemplateOutlet, LucideAngularModule, TuiButton, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Menús" subtitle="Estructura jerárquica de navegación">
      <button tuiButton appearance="primary" size="m">
        <lucide-icon name="plus" class="w-4 h-4 mr-1" />
        Nuevo menú
      </button>
    </app-page-header>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      @if (store.isLoading()) {
        <div class="flex items-center justify-center py-16">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (store.menuTree().length === 0) {
        <app-empty-state message="No se encontraron menús" />
      } @else {
        <div class="p-4 space-y-1">
          @for (node of store.menuTree(); track node.idMenu) {
            <ng-container *ngTemplateOutlet="menuNode; context: { $implicit: node, depth: 0 }" />
          }
        </div>
      }
    </div>

    <ng-template #menuNode let-node let-depth="depth">
      <div [style.paddingLeft.px]="depth * 20"
           class="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 group">
        <div class="flex items-center gap-3">
          @if (node.children.length > 0) {
            <lucide-icon name="chevron-right" class="w-4 h-4 text-slate-400" />
          } @else {
            <span class="w-4"></span>
          }
          <lucide-icon name="layout-list" class="w-4 h-4 text-slate-400" />
          <span class="text-sm font-medium text-slate-700">{{ node.menuName }}</span>
          @if (node.url) {
            <span class="text-xs text-slate-400 font-mono">{{ node.url }}</span>
          }
          @if (!node.visible) {
            <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Oculto</span>
          }
          @if (!node.isActive) {
            <span class="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactivo</span>
          }
        </div>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button tuiButton appearance="flat" size="xs">
            <lucide-icon name="pencil" class="w-3.5 h-3.5" />
          </button>
          <button tuiButton appearance="destructive" size="xs" (click)="store.deleteMenu(node.idMenu)">
            <lucide-icon name="trash-2" class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      @for (child of node.children; track child.idMenu) {
        <ng-container *ngTemplateOutlet="menuNode; context: { $implicit: child, depth: depth + 1 }" />
      }
    </ng-template>
  `,
})
export class MenuListComponent implements OnInit {
  protected readonly store = inject(MenusStore);

  ngOnInit(): void {
    this.store.loadAll(this.store.paginationParams());
  }
}
