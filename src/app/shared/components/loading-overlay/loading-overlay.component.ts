import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div class="flex flex-col items-center gap-3 bg-white rounded-xl p-6 shadow-lg">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-slate-600 font-medium">Cargando...</span>
        </div>
      </div>
    }
  `,
})
export class LoadingOverlayComponent {
  protected readonly loadingService = inject(LoadingService);
}
