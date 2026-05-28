import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'active' | 'inactive' | 'deleted';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClass()">
      {{ label() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<BadgeStatus>();

  label() {
    const map: Record<BadgeStatus, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      deleted: 'Eliminado',
    };
    return map[this.status()];
  }

  badgeClass() {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const map: Record<BadgeStatus, string> = {
      active: `${base} bg-green-100 text-green-800`,
      inactive: `${base} bg-amber-100 text-amber-800`,
      deleted: `${base} bg-red-100 text-red-800`,
    };
    return map[this.status()];
  }
}
