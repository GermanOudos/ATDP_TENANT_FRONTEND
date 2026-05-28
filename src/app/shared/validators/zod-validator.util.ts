import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ZodType } from 'zod';

export function zodValidator<T>(schema: ZodType<T>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') {
      return null; // let required validator handle empty
    }
    const result = schema.safeParse(control.value);
    if (result.success) return null;
    const firstError = result.error.issues[0];
    return { zodError: firstError.message };
  };
}

export function zodGroupValidator<T>(schema: ZodType<T>): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(group.value);
    if (result.success) return null;
    const errors: ValidationErrors = {};
    result.error.issues.forEach((e) => {
      const path = e.path.join('.');
      if (path) errors[`zodGroup_${path}`] = e.message;
    });
    return Object.keys(errors).length ? errors : null;
  };
}
