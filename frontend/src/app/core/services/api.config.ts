import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from './session.service';

export const API_BASE_URL = 'http://localhost:8080/api/v1';

// Feature 54: origin del backend (sin el sufijo /api/v1). Las imágenes del catálogo
// de plagas se sirven en el origin (/uploads/...), no bajo /api/v1.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getAccessToken();

  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
