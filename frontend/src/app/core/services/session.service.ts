import { Injectable } from '@angular/core';
import type { AuthResponse, AuthUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'current_user';

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  getAccessToken() {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken() {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(this.refreshTokenKey);
  }

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  persistSession(session: AuthResponse) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.accessTokenKey, session.accessToken);
    window.localStorage.setItem(this.refreshTokenKey, session.refreshToken);
    window.localStorage.setItem(this.userKey, JSON.stringify(session.user));
  }

  clear() {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.accessTokenKey);
    window.localStorage.removeItem(this.refreshTokenKey);
    window.localStorage.removeItem(this.userKey);
  }
}
