import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminMenuService } from '../../core/services/admin-menu.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.css',
})
export class DashboardShellComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(AdminMenuService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly collapsed = signal(false);
  protected readonly visibleMenuKeys = signal<Set<string> | null>(null);
  protected readonly currentUser = this.session.getCurrentUser();
  protected readonly currentUserName = this.currentUser?.name ?? this.currentUser?.email ?? 'Operador';
  protected readonly currentUserRole = this.currentUser?.roles?.[0]?.replace('ROLE_', '') ?? 'Usuario activo';
  protected readonly currentUserInitials = this.buildInitials(this.currentUserName);

  ngOnInit(): void {
    this.menuService.getCurrentUserOptions().subscribe({
      next: (options) => this.visibleMenuKeys.set(new Set(options.map((option) => option.key))),
      error: () => this.visibleMenuKeys.set(null),
    });
  }

  protected isMenuVisible(key: string) {
    const keys = this.visibleMenuKeys();
    return keys === null || keys.has(key);
  }

  toggleSidebar() {
    this.collapsed.update((value) => !value);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout() {
    this.session.clear();
    void this.router.navigate(['/login']);
  }

  private buildInitials(value: string) {
    return value
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }
}

