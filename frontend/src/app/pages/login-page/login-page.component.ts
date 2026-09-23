import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';

// Feature 83: rediseño del login (mapa de lotes + emblema de dominios). Solo login;
// las cuentas las gestiona el administrador del establecimiento (ayuda inline).
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

  protected email = '';
  protected password = '';
  protected loading = false;
  protected errorMessage = '';
  protected showPassword = false;
  protected showHelp = false;

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  protected toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  submit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (session) => {
        this.session.persistSession(session);
        void this.router.navigate(['/agricola/lotes']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'No se pudo iniciar sesión con esas credenciales.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
