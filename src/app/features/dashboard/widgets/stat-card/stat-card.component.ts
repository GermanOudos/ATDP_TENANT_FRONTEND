import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-sm font-medium text-slate-500">{{ title() }}</p>
        <div class="flex h-9 w-9 items-center justify-center rounded-lg" [class]="iconBgClass()">
          <lucide-icon [name]="icon()" class="h-5 w-5" [class]="iconTextClass()" />
        </div>
      </div>
      <p class="text-3xl font-bold text-slate-900">{{ value() }}</p>
      @if (subtitle()) {
        <p class="mt-1 text-xs text-slate-400">{{ subtitle() }}</p>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('layers');
  readonly tone = input<'blue' | 'green' | 'amber' | 'purple' | 'red'>('blue');

  protected iconBgClass(): string {
    return {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      amber: 'bg-amber-50',
      purple: 'bg-purple-50',
      red: 'bg-red-50',
    }[this.tone()];
  }

  protected iconTextClass(): string {
    return {
      blue: 'text-blue-500',
      green: 'text-green-500',
      amber: 'text-amber-500',
      purple: 'text-purple-500',
      red: 'text-red-500',
    }[this.tone()];
  }
}
