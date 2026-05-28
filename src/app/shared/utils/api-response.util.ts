import { BaseResponse } from '@schemas/api-response.schema';

export class ApiError extends Error {
  constructor(
    public readonly code: string | null | undefined,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiValidationError extends Error {
  constructor(public readonly messages: string[]) {
    super(messages.join(', '));
    this.name = 'ApiValidationError';
  }
}

export function unwrapResponse<T>(res: BaseResponse<T>): T {
  if (!res.ok) {
    if (res.codeError === 'VALIDATION_ERROR' && res.validationErrors?.length) {
      throw new ApiValidationError(res.validationErrors);
    }
    throw new ApiError(res.codeError, res.error ?? 'Error inesperado');
  }
  return res.data as T;
}

export const ERROR_MESSAGES: Record<string, string> = {
  TENANT_DUPLICATE: 'Ya existe un tenant con ese ID Cliente RNEC.',
  USER_DUPLICATE: 'Ya existe un usuario con ese correo electrónico.',
  ROLE_DUPLICATE: 'Ya existe un rol con ese nombre.',
  INVALID_CREDENTIALS: 'Credenciales incorrectas. Verifica tu usuario y contraseña.',
  PASSWORD_REUSE_CURRENT: 'No puedes usar la misma contraseña actual.',
  PASSWORD_REUSE_HISTORY: 'No puedes reutilizar una de tus últimas contraseñas.',
  SECRET_REUSE_CURRENT: 'No puedes usar el mismo secreto activo.',
  TSA_URL_DUPLICATE: 'El TSA principal y de contingencia no pueden tener la misma URL.',
  NO_CHANGES_DETECTED: 'No se detectaron cambios para guardar.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  TOKEN_EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
};

export function getErrorMessage(code?: string | null, fallback?: string): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return fallback ?? 'Error inesperado. Intenta de nuevo.';
}
