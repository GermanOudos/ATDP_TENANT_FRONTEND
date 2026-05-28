import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError, ApiValidationError, getErrorMessage } from '@shared/utils/api-response.util';
import { BaseResponse } from '@schemas/api-response.schema';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const isLoginRequest = req.url.includes('/api/auth/login');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body =
        typeof err.error === 'object' && err.error !== null
          ? (err.error as BaseResponse<unknown>)
          : undefined;
      const code = body?.codeError;
      const wwwAuthenticate = err.headers?.get('www-authenticate') ?? '';
      const backendReturnedHtml = typeof err.error === 'string' && /<!doctype html>|<html/i.test(err.error);
      const isSessionAuthError =
        (err.status === 401 && !isLoginRequest) ||
        code === 'TOKEN_EXPIRED' ||
        code === 'UNAUTHORIZED';

      if (err.status === 401 && isLoginRequest) {
        const authGatewayMessage = wwwAuthenticate.toLowerCase().includes('basic')
          ? 'El servidor de autenticación exige Basic Auth. Verifica configuración del backend/proxy y credenciales del servidor.'
          : undefined;

        const loginMessage = getErrorMessage(
          code,
          authGatewayMessage ??
            (backendReturnedHtml
              ? 'El backend rechazó el acceso (401). Verifica usuario/contraseña y que el endpoint de login sea el correcto.'
              : body?.error ?? 'Credenciales incorrectas. Verifica tu usuario y contraseña.')
        );
        return throwError(() => new ApiError(code, loginMessage));
      }

      if (isSessionAuthError) {
        if (!isLoginRequest) {
          router.navigate(['/login']);
        }
        return throwError(() => new ApiError(code, 'Unauthorized'));
      }

      if (err.status === 403 || code === 'FORBIDDEN') {
        return throwError(() => new ApiError(code, 'Forbidden'));
      }

      if (body?.codeError === 'VALIDATION_ERROR' && body.validationErrors?.length) {
        return throwError(() => new ApiValidationError(body.validationErrors));
      }

      if (err.status >= 500) {
        return throwError(() => new ApiError(code, body?.error ?? 'Server error'));
      }

      const message = getErrorMessage(code, body?.error ?? undefined);
      return throwError(() => new ApiError(code, message));
    })
  );
};
