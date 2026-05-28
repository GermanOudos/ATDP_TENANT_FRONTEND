import { Component, input, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-tsa-config-status-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <h3 class="mb-4 text-sm font-semibold text-slate-700">Configuración TSA</h3>
      @if (hasData()) {
        <apx-chart
          [series]="series()"
          [chart]="{ type: 'bar', height: 160, stacked: true, toolbar: { show: false }, animations: { enabled: false } }"
          [xaxis]="{ categories: ['Principal', 'Contingencia'] }"
          [colors]="['#22c55e', '#e2e8f0']"
          [plotOptions]="{ bar: { horizontal: true, borderRadius: 4 } }"
          [legend]="{ show: false }"
          [dataLabels]="{ enabled: true }"
          [grid]="{ strokeDashArray: 4 }"
        />
      } @else {
        <div class="flex h-[160px] items-center justify-center text-sm text-slate-400">Sin datos</div>
      }
    </div>
  `,
})
export class TsaConfigStatusChartComponent {
  readonly series = input<{ name: string; data: number[] }[]>([]);
  readonly hasData = computed(() => this.series().length > 0 && this.series()[0]?.data.some((v) => v > 0));
}
