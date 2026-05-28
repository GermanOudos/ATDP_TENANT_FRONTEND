import { Injectable, signal, computed } from '@angular/core';
import { ValidationRules } from '@schemas/metadata.schema';

@Injectable({ providedIn: 'root' })
export class MetadataStore {
  private readonly _rules = signal<ValidationRules | null>(null);

  readonly rules = computed(() => this._rules());
  readonly loaded = computed(() => this._rules() !== null);

  setRules(rules: ValidationRules): void {
    this._rules.set(rules);
  }
}
