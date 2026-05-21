import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '../models/agricola.models';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth.models';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(data: LoginRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/login`, data).pipe(map((response) => response.data));
  }

  register(data: RegisterRequest) {
    return this.http.post<ApiResponse<AuthResponse>>(`${API_BASE_URL}/auth/register`, data).pipe(map((response) => response.data));
  }

  me() {
    return this.http.get<ApiResponse<AuthUser>>(`${API_BASE_URL}/auth/me`).pipe(map((response) => response.data));
  }

  logout() {
    return this.http.post(`${API_BASE_URL}/auth/logout`, {});
  }
}
