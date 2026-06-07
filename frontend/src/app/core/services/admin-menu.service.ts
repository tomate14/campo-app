import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { map } from 'rxjs'
import type { CreateRoleRequest, MenuOption, RoleMenuPermissions, RoleOption } from '../models/menu-permissions.models'
import { API_BASE_URL } from './api.config'
import type { ApiResponse } from './api.types'

function unwrapApiResponse<T>(response: ApiResponse<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data
  }
  return response as T
}

@Injectable({ providedIn: 'root' })
export class AdminMenuService {
  private readonly http = inject(HttpClient)

  getMatrix() {
    return this.http.get<ApiResponse<RoleMenuPermissions[]> | RoleMenuPermissions[]>(`${API_BASE_URL}/admin/menu-permissions`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  updateRole(roleId: string, menuKeys: string[]) {
    return this.http.put<ApiResponse<RoleMenuPermissions> | RoleMenuPermissions>(`${API_BASE_URL}/admin/roles/${roleId}/menu-options`, { menuKeys })
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  createRole(data: CreateRoleRequest) {
    return this.http.post<ApiResponse<RoleMenuPermissions> | RoleMenuPermissions>(`${API_BASE_URL}/admin/roles`, data)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getCurrentUserOptions() {
    return this.http.get<ApiResponse<MenuOption[]> | MenuOption[]>(`${API_BASE_URL}/menu-options/me`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }

  getRoles() {
    return this.http.get<ApiResponse<RoleOption[]> | RoleOption[]>(`${API_BASE_URL}/menu-options/roles`)
      .pipe(map((response) => unwrapApiResponse(response)))
  }
}
