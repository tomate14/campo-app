import { CommonModule } from '@angular/common'
import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { MenuOption, RoleMenuPermissions } from '../../core/models/menu-permissions.models'
import { AdminMenuService } from '../../core/services/admin-menu.service'

@Component({
  selector: 'app-admin-roles-menu-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles-menu-page.component.html',
  styleUrl: './admin-roles-menu-page.component.css',
})
export class AdminRolesMenuPageComponent implements OnInit {
  private readonly menuService = inject(AdminMenuService)

  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  protected readonly successMessage = signal('')
  protected readonly matrix = signal<RoleMenuPermissions[]>([])
  protected readonly selectedRoleId = signal('')
  protected readonly draftKeys = signal<Set<string>>(new Set())
  protected readonly roleModalOpen = signal(false)
  protected readonly roleForm = signal({ name: '', description: '', enableAllMenuOptions: true })

  protected readonly selectedRole = computed(() => this.matrix().find((role) => role.roleId === this.selectedRoleId()) ?? null)
  protected readonly enabledCount = computed(() => this.draftKeys().size)
  protected readonly totalOptions = computed(() => this.selectedRole()?.options.length ?? 0)
  protected readonly groupedOptions = computed(() => {
    const groups = new Map<string, MenuOption[]>()
    for (const option of this.selectedRole()?.options ?? []) {
      const items = groups.get(option.section) ?? []
      items.push(option)
      groups.set(option.section, items)
    }
    return Array.from(groups.entries()).map(([section, options]) => ({
      section,
      options: options.sort((a, b) => a.displayOrder - b.displayOrder),
    }))
  })

  ngOnInit(): void {
    this.load()
  }

  protected load() {
    this.loading.set(true)
    this.errorMessage.set('')
    this.menuService.getMatrix().subscribe({
      next: (matrix) => {
        this.matrix.set(matrix)
        const selected = this.selectedRoleId() || matrix.find((role) => this.isAdminRole(role.roleName))?.roleId || matrix[0]?.roleId || ''
        this.selectRole(selected)
        this.loading.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la matriz de permisos de menu.')
        this.loading.set(false)
      },
    })
  }

  protected selectRole(roleId: string) {
    const role = this.matrix().find((item) => item.roleId === roleId)
    if (!role) return
    this.selectedRoleId.set(roleId)
    this.draftKeys.set(new Set(role.options.filter((option) => option.enabled).map((option) => option.key)))
    this.successMessage.set('')
  }

  protected toggleOption(option: MenuOption) {
    const role = this.selectedRole()
    if (!role || this.isLockedAdminOption(role, option)) return
    const next = new Set(this.draftKeys())
    if (next.has(option.key)) {
      next.delete(option.key)
    } else {
      next.add(option.key)
    }
    this.draftKeys.set(next)
  }

  protected isEnabled(option: MenuOption) {
    return this.draftKeys().has(option.key)
  }

  protected isLockedAdminOption(role: RoleMenuPermissions, option: MenuOption) {
    return this.isAdminRole(role.roleName) && option.key === 'admin-roles-menu'
  }

  protected visibleOptionsCount(role: RoleMenuPermissions) {
    if (role.roleId === this.selectedRoleId()) {
      return this.enabledCount()
    }
    return role.options.filter((option) => option.enabled).length
  }

  protected save() {
    const role = this.selectedRole()
    if (!role) return
    this.saving.set(true)
    this.errorMessage.set('')
    this.successMessage.set('')
    this.menuService.updateRole(role.roleId, Array.from(this.draftKeys())).subscribe({
      next: (updated) => {
        this.matrix.update((matrix) => matrix.map((item) => item.roleId === updated.roleId ? updated : item))
        this.selectRole(updated.roleId)
        this.successMessage.set('Permisos de menu actualizados.')
        this.saving.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudieron guardar los permisos del rol.')
        this.saving.set(false)
      },
    })
  }

  protected openRoleModal() {
    this.roleForm.set({ name: '', description: '', enableAllMenuOptions: true })
    this.roleModalOpen.set(true)
  }

  protected closeRoleModal() {
    this.roleModalOpen.set(false)
    this.saving.set(false)
  }

  protected createRole() {
    const form = this.roleForm()
    if (!form.name.trim()) {
      this.errorMessage.set('El nombre del rol es obligatorio.')
      return
    }
    this.saving.set(true)
    this.errorMessage.set('')
    this.successMessage.set('')
    this.menuService.createRole({
      name: form.name,
      description: form.description,
      enableAllMenuOptions: form.enableAllMenuOptions,
    }).subscribe({
      next: (role) => {
        this.matrix.update((matrix) => [...matrix, role].sort((a, b) => a.roleName.localeCompare(b.roleName)))
        this.selectRole(role.roleId)
        this.successMessage.set('Rol creado correctamente.')
        this.roleModalOpen.set(false)
        this.saving.set(false)
      },
      error: () => {
        this.errorMessage.set('No se pudo crear el rol.')
        this.saving.set(false)
      },
    })
  }

  protected roleLabel(roleName: string) {
    return roleName.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  }

  protected isAdminRole(roleName: string) {
    return roleName === 'admin' || roleName === 'super_admin'
  }
}
