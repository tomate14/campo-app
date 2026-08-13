import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import type {
  DeteccionPlaga,
  EstadoOrdenAplicacion,
  Lote,
  OrdenAplicacion,
  OrdenAplicacionRequest,
} from '../../core/models/agricola.models';
import type { Operario } from '../../core/models/operarios.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { OperariosService } from '../../core/services/operarios.service';
import { SessionService } from '../../core/services/session.service';

type OrdenFormState = OrdenAplicacionRequest & { id?: string };

@Component({
  selector: 'app-ordenes-aplicacion-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes-aplicacion-page.component.html',
  styleUrl: './ordenes-aplicacion-page.component.css',
})
export class OrdenesAplicacionPageComponent implements OnInit {
  private readonly agricolaService = inject(AgricolaService);
  private readonly operariosService = inject(OperariosService);
  private readonly sessionService = inject(SessionService);
  private readonly route = inject(ActivatedRoute);

  protected readonly ordenes = signal<OrdenAplicacion[]>([]);
  protected readonly operarios = signal<Operario[]>([]);
  protected readonly lotes = signal<Lote[]>([]);
  protected readonly detecciones = signal<DeteccionPlaga[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  // Filtros de la barra superior.
  protected readonly filtroEstado = signal<EstadoOrdenAplicacion | ''>('');
  protected readonly filtroOperario = signal<string>('');
  protected readonly filtroTexto = signal<string>('');
  protected readonly soloMias = signal(false);

  protected readonly estados: EstadoOrdenAplicacion[] = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA'];

  // Modal de alta/edicion.
  protected readonly modalOpen = signal(false);
  protected readonly form = signal<OrdenFormState>(this.emptyForm());

  protected readonly operariosActivos = computed(() => this.operarios().filter((o) => o.estado === 'ACTIVO'));

  protected readonly deteccionesDelLote = computed(() => {
    const loteId = this.form().loteId;
    return this.detecciones().filter((d) => d.loteId === loteId);
  });

  protected readonly ordenesFiltradas = computed(() => {
    const estado = this.filtroEstado();
    const operario = this.filtroOperario();
    const texto = this.filtroTexto().trim().toLowerCase();
    const miOperarioId = this.miOperarioId();
    const soloMias = this.soloMias();
    return this.ordenes().filter((orden) => {
      if (estado && orden.estado !== estado) return false;
      if (operario && orden.operarioId !== operario) return false;
      if (soloMias && miOperarioId && orden.responsableId !== miOperarioId) return false;
      if (texto) {
        const haystack = `${orden.numero ?? ''} ${orden.producto} ${orden.loteNombre} ${orden.plagaNombre} ${orden.operarioNombre ?? ''} ${orden.responsableNombre ?? ''}`.toLowerCase();
        if (!haystack.includes(texto)) return false;
      }
      return true;
    });
  });

  ngOnInit(): void {
    this.loadAll();
    // Feature 58: si se llega desde la burbuja del mapa (?nueva=1), abre el alta preseleccionando.
    const params = this.route.snapshot.queryParamMap;
    if (params.get('nueva')) {
      const loteId = params.get('loteId') ?? '';
      const deteccionId = params.get('deteccionId') ?? '';
      this.form.set({ ...this.form(), loteId, deteccionId });
      this.modalOpen.set(true);
    }
  }

  protected loadAll(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      ordenes: this.agricolaService.getOrdenesAplicacion(),
      operarios: this.operariosService.getOperarios({ estado: 'ACTIVO' }),
      lotes: this.agricolaService.getLotes(undefined),
      detecciones: this.agricolaService.getDeteccionesPlaga(),
    }).subscribe({
      next: ({ ordenes, operarios, lotes, detecciones }) => {
        this.ordenes.set(Array.isArray(ordenes) ? ordenes : []);
        this.operarios.set(Array.isArray(operarios) ? operarios : []);
        this.lotes.set(Array.isArray(lotes) ? lotes : []);
        this.detecciones.set(Array.isArray(detecciones) ? detecciones : []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudieron cargar las órdenes de aplicación.');
      },
    });
  }

  private reloadOrdenes(): void {
    this.agricolaService.getOrdenesAplicacion().subscribe((ordenes) => this.ordenes.set(Array.isArray(ordenes) ? ordenes : []));
  }

  // Operario vinculado al usuario logueado (para "solo mías" y para saber si soy el asignado).
  protected miOperarioId(): string | undefined {
    const userId = this.sessionService.getCurrentUser()?.id;
    if (!userId) return undefined;
    return this.operarios().find((o) => o.userId === userId)?.id;
  }

  protected estadoLabel(estado: EstadoOrdenAplicacion): string {
    return estado === 'ACEPTADA' ? 'Aceptada' : estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente';
  }

  protected estadoClass(estado: EstadoOrdenAplicacion): string {
    return `estado-badge estado-${estado.toLowerCase()}`;
  }

  protected soyResponsable(orden: OrdenAplicacion): boolean {
    const mi = this.miOperarioId();
    return !!mi && orden.responsableId === mi;
  }

  protected soyOperario(orden: OrdenAplicacion): boolean {
    const mi = this.miOperarioId();
    return !!mi && orden.operarioId === mi;
  }

  // ---- Alta / edicion ----

  protected nuevaOrden(): void {
    this.form.set(this.emptyForm());
    this.modalOpen.set(true);
  }

  protected editarOrden(orden: OrdenAplicacion): void {
    this.form.set({
      id: orden.id,
      loteId: orden.loteId,
      deteccionId: orden.deteccionId,
      fechaAplicacion: orden.fechaAplicacion?.slice(0, 16),
      producto: orden.producto,
      principioActivo: orden.principioActivo,
      dosis: orden.dosis,
      unidadDosis: orden.unidadDosis,
      volumenCaldoLHa: orden.volumenCaldoLHa,
      superficieTratadaHa: orden.superficieTratadaHa,
      periodoCarenciaDias: orden.periodoCarenciaDias,
      periodoReingresoHoras: orden.periodoReingresoHoras,
      maquinariaId: orden.maquinariaId,
      condicionesClimaticas: orden.condicionesClimaticas,
      observaciones: orden.observaciones,
      operarioId: orden.operarioId,
    });
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected onLoteChange(loteId: string): void {
    // Al cambiar el lote se resetea la deteccion seleccionada.
    this.form.update((f) => ({ ...f, loteId, deteccionId: '' }));
  }

  protected guardar(): void {
    const state = this.form();
    if (!state.loteId || !state.deteccionId || !state.producto || !state.unidadDosis || state.dosis == null || !state.operarioId) {
      this.error.set('Completá lote, detección, producto, dosis, unidad y operario asignado.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const payload: OrdenAplicacionRequest = {
      loteId: state.loteId,
      deteccionId: state.deteccionId,
      fechaAplicacion: state.fechaAplicacion,
      producto: state.producto,
      principioActivo: state.principioActivo,
      dosis: Number(state.dosis),
      unidadDosis: state.unidadDosis,
      volumenCaldoLHa: state.volumenCaldoLHa != null ? Number(state.volumenCaldoLHa) : undefined,
      superficieTratadaHa: state.superficieTratadaHa != null ? Number(state.superficieTratadaHa) : undefined,
      periodoCarenciaDias: state.periodoCarenciaDias != null ? Number(state.periodoCarenciaDias) : undefined,
      periodoReingresoHoras: state.periodoReingresoHoras != null ? Number(state.periodoReingresoHoras) : undefined,
      maquinariaId: state.maquinariaId,
      condicionesClimaticas: state.condicionesClimaticas,
      observaciones: state.observaciones,
      operarioId: state.operarioId,
    };
    const request$ = state.id
      ? this.agricolaService.updateOrdenAplicacion(state.id, payload)
      : this.agricolaService.createOrdenAplicacion(payload);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.reloadOrdenes();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('No se pudo guardar la orden de aplicación.');
      },
    });
  }

  // ---- Aceptar / rechazar ----

  protected aceptar(orden: OrdenAplicacion): void {
    this.agricolaService.aceptarOrdenAplicacion(orden.id).subscribe({
      next: () => this.reloadOrdenes(),
      error: () => this.error.set('No se pudo aceptar la orden.'),
    });
  }

  protected rechazar(orden: OrdenAplicacion): void {
    const motivo = window.prompt('Motivo del rechazo (opcional):') ?? undefined;
    this.agricolaService.rechazarOrdenAplicacion(orden.id, motivo).subscribe({
      next: () => this.reloadOrdenes(),
      error: () => this.error.set('No se pudo rechazar la orden.'),
    });
  }

  private emptyForm(): OrdenFormState {
    return {
      loteId: '',
      deteccionId: '',
      producto: '',
      dosis: 0,
      unidadDosis: 'l/ha',
      operarioId: '',
    };
  }
}
