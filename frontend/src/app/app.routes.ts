import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { DashboardShellComponent } from './layout/dashboard-shell/dashboard-shell.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LotesPageComponent } from './pages/lotes-page/lotes-page.component';
import { LoteDetailPageComponent } from './pages/lote-detail-page/lote-detail-page.component';
import { SiembraPageComponent } from './pages/siembra-page/siembra-page.component';
import { ClimaPageComponent } from './pages/clima-page/clima-page.component';
import { AnalyticsPageComponent } from './pages/analytics-page/analytics-page.component';
import { GanaderiaTrazabilidadPageComponent } from './pages/ganaderia-trazabilidad-page/ganaderia-trazabilidad-page.component';
import { GanaderiaSanidadPageComponent } from './pages/ganaderia-sanidad-page/ganaderia-sanidad-page.component';
import { GanaderiaReproduccionPageComponent } from './pages/ganaderia-reproduccion-page/ganaderia-reproduccion-page.component';
import { GanaderiaAlimentacionPageComponent } from './pages/ganaderia-alimentacion-page/ganaderia-alimentacion-page.component';
import { MaquinariaInventarioPageComponent } from './pages/maquinaria-inventario-page/maquinaria-inventario-page.component';
import { MaquinariaMantenimientoPageComponent } from './pages/maquinaria-mantenimiento-page/maquinaria-mantenimiento-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agricola/lotes' },
      { path: 'agricola/lotes', component: LotesPageComponent },
      { path: 'agricola/lotes/:id', component: LoteDetailPageComponent },
      { path: 'agricola/siembra', component: SiembraPageComponent },
      { path: 'agricola/cosecha', redirectTo: 'agricola/siembra' },
      { path: 'agricola/analytics', component: AnalyticsPageComponent },
      { path: 'ganaderia/trazabilidad', component: GanaderiaTrazabilidadPageComponent },
      { path: 'ganaderia/sanidad', component: GanaderiaSanidadPageComponent },
      { path: 'ganaderia/reproduccion', component: GanaderiaReproduccionPageComponent },
      { path: 'ganaderia/alimentacion', component: GanaderiaAlimentacionPageComponent },
      { path: 'maquinaria/inventario', component: MaquinariaInventarioPageComponent },
      { path: 'maquinaria/mantenimiento', component: MaquinariaMantenimientoPageComponent },
      { path: 'clima', component: ClimaPageComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];

