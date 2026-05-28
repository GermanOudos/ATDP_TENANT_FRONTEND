import { Component, input, computed } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-tenants-growth-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-5">
      <h3 class="mb-4 text-sm font-semibold text-slate-700">Crecimiento mensual</h3>
      @if (hasData()) {
        <apx-chart
          [series]="[{ name: 'Tenants', data: data() }]"
          [chart]="{ type: 'area', height: 220, toolbar: { show: false }, animations: { enabled: false } }"
          [xaxis]="{ categories: categories(), labels: { rotate: -45, style: { fontSize: '10px' } } }"
          [colors]="['#3b82f6']"
          [fill]="{ type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } }"
          [stroke]="{ curve: 'smooth', width: 2 }"
          [dataLabels]="{ enabled: false }"
          [grid]="{ strokeDashArray: 4 }"
        />
      } @else {
        <div class="flex h-[220px] items-center justify-center text-sm text-slate-400">Sin datos</div>
      }
    </div>
  `,
})
export class TenantsGrowthChartComponent {
  readonly categories = input<string[]>([]);
  readonly data = input<number[]>([]);
  readonly hasData = computed(() => this.data().length > 0);
}
