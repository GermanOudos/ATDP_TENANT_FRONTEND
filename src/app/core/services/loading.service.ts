import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly _counter = signal(0);

  readonly isLoading = computed(() => this._counter() > 0);

  increment(): void {
    this._counter.update((c) => c + 1);
  }

  decrement(): void {
    this._counter.update((c) => Math.max(0, c - 1));
  }
}
