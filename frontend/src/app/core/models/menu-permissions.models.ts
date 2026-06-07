export interface MenuOption {
  id: string
  key: string
  label: string
  route: string
  section: string
  icon: string
  displayOrder: number
  enabled: boolean
}

export interface RoleMenuPermissions {
  roleId: string
  roleName: string
  description?: string
  options: MenuOption[]
}

export interface RoleOption {
  roleId: string
  roleName: string
  description?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  enableAllMenuOptions: boolean
}
