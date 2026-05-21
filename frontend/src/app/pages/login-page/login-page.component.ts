import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected mode: 'login' | 'register' = 'login';
  protected name = '';
  protected email = '';
  protected password = '';
  protected loading = false;
  protected errorMessage = '';

  submit() {
    this.loading = true;
    this.errorMessage = '';

    const request$ = this.mode === 'login'
      ? this.authService.login({ email: this.email, password: this.password })
      : this.authService.register({ email: this.email, password: this.password, name: this.name });

    request$.subscribe({
      next: (session) => {
        this.session.persistSession(session);
        void this.router.navigate(['/agricola/lotes']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo completar la operacion con esas credenciales.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}

