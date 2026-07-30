import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from './session.service';

export const API_BASE_URL = '/api/v1';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getAccessToken();

  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
