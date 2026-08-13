import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import type {
  AplicacionFitosanitaria,
  DeteccionPlaga,
  EventoSiembra,
  HistoricoCultivo,
  RegistroCosecha,
  SeguimientoPlaga,
  SeveridadPlaga,
} from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';

type HistorialCampo = { label: string; value: string };
type HistorialEvento = {
  tipo: string;
  fecha: string;
  titulo: string;
  color: string;
  campos: HistorialCampo[];
};

// Timeline del historico de un lote (fuente unica web, replica del historico mobile).
// Card colapsable: colapsada muestra tipo + fecha + titulo; al expandir lista TODOS los campos del evento.
@Component({
  selector: 'app-lote-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-historial.component.html',
  styleUrl: './lote-historial.component.css',
})
export class LoteHistorialComponent implements OnChanges {
  private readonly agricolaService = inject(AgricolaService);

  @Input({ required: true }) loteId!: string;

  protected readonly eventos = signal<HistorialEvento[]>([]);
  protected readonly loading = signal(false);
  protected readonly expandido = signal<number | null>(null);

  ngOnChanges(): void {
    if (this.loteId) {
      this.load();
    } else {
      this.eventos.set([]);
    }
  }

  protected toggle(index: number): void {
    this.expandido.set(this.expandido() === index ? null : index);
  }

  private load(): void {
    const loteId = this.loteId;
    this.loading.set(true);
    this.eventos.set([]);
    this.expandido.set(null);

    forkJoin({
      siembra: this.agricolaService.getEventosByLote(loteId),
      cosechas: this.agricolaService.getCosechasByLote(loteId),
      cultivos: this.agricolaService.getHistorialByLote(loteId),
      aplicaciones: this.agricolaService.getAplicacionesFitosanitarias(),
      seguimientos: this.agricolaService.getSeguimientosPlaga(),
      detecciones: this.agricolaService.getDeteccionesPlaga({ loteId }),
    }).subscribe({
      next: ({ siembra, cosechas, cultivos, aplicaciones, seguimientos, detecciones }) => {
        this.eventos.set(this.build(loteId, siembra, cosechas, cultivos, aplicaciones, seguimientos, detecciones));
        this.loading.set(false);
      },
      error: () => {
        this.eventos.set([]);
        this.loading.set(false);
      },
    });
  }

  // ---- Construccion de eventos ----

  private build(
    loteId: string,
    siembra: EventoSiembra[],
    cosechas: RegistroCosecha[],
    cultivos: HistoricoCultivo[],
    aplicaciones: AplicacionFitosanitaria[],
    seguimientos: SeguimientoPlaga[],
    detecciones: DeteccionPlaga[],
  ): HistorialEvento[] {
    const deteccionesLote = detecciones.filter((item) => item.loteId === loteId);
    const detectionIds = new Set(deteccionesLote.map((item) => item.id));

    const deteccionEvents = deteccionesLote.map((item) => this.deteccionEvento(item));
    const aplicacionEvents = aplicaciones
      .filter((item) => item.loteId === loteId)
      .map((item) => this.aplicacionEvento(item));
    const seguimientoEvents = seguimientos
      .filter((item) => detectionIds.has(item.deteccionId))
      .map((item) => this.seguimientoEvento(item));

    const siembraEvents = siembra.map((item): HistorialEvento => ({
      tipo: item.tipoEvento === 'SIEMBRA' ? 'Siembra' : 'Evento',
      fecha: item.fecha,
      titulo: item.estadoFenologico || item.tipoEvento,
      color: '#9FE870',
      campos: this.buildCampos([
        ['Tipo de evento', item.tipoEvento],
        ['Estado fenológico', item.estadoFenologico],
        ['Descripción', item.descripcion],
        ['Registrado', this.fmtFecha(item.createdAt)],
      ]),
    }));

    const cosechaEvents = cosechas.map((item): HistorialEvento => ({
      tipo: 'Cosecha',
      fecha: item.fecha,
      titulo: `${this.num(item.rendimientoKgHa ?? 0)} kg/ha`,
      color: '#FFB84D',
      campos: this.buildCampos([
        ['Toneladas', item.toneladasTotal != null ? `${this.num(item.toneladasTotal)} tn` : ''],
        ['Calidad de grano', item.calidadGrano],
        ['Humedad', item.humedad != null ? `${item.humedad} %` : ''],
        ['Área real cosechada', item.areaRealCosechadaPct != null ? `${item.areaRealCosechadaPct} %` : ''],
        ['Ha cosechadas', item.hectareasCosechadas != null ? `${this.num(item.hectareasCosechadas)} ha` : ''],
        ['Pérdida', item.perdidaKgHa != null ? `${this.num(item.perdidaKgHa)} kg/ha` : ''],
        ['Granos perdidos', item.granosPerdidosKg != null ? `${this.num(item.granosPerdidosKg)} kg` : ''],
        ['Tipo de pérdida', item.tipoPerdidaNombre || item.tipoPerdida],
        ['Destino', item.destinoNombre || item.destino],
        ['Destino (cantidad)', item.destinoCantidadTn != null ? `${this.num(item.destinoCantidadTn)} tn` : ''],
        ['Observaciones', item.observaciones],
        ['Registrado', this.fmtFecha(item.createdAt)],
      ]),
    }));

    const cultivoEvents = cultivos.flatMap((item): HistorialEvento[] => {
      const events: HistorialEvento[] = [];
      if (item.fechaSiembra) {
        events.push({
          tipo: 'Historial',
          fecha: item.fechaSiembra,
          titulo: `Siembra ${item.cultivo}`,
          color: '#9FE870',
          campos: this.buildCampos([
            ['Cultivo', item.cultivo],
            ['Temporada', item.temporada],
            ['Observaciones', item.observaciones],
          ]),
        });
      }
      if (item.fechaCosecha) {
        events.push({
          tipo: 'Historial',
          fecha: item.fechaCosecha,
          titulo: `Cosecha ${item.cultivo}`,
          color: '#FFB84D',
          campos: this.buildCampos([
            ['Cultivo', item.cultivo],
            ['Temporada', item.temporada],
            ['Rendimiento', item.rendimientoKgHa != null ? `${this.num(item.rendimientoKgHa)} kg/ha` : ''],
            ['Observaciones', item.observaciones],
          ]),
        });
      }
      return events;
    });

    return [
      ...deteccionEvents,
      ...aplicacionEvents,
      ...seguimientoEvents,
      ...siembraEvents,
      ...cosechaEvents,
      ...cultivoEvents,
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  private deteccionEvento(item: DeteccionPlaga): HistorialEvento {
    return {
      tipo: 'Detección',
      fecha: item.fechaDeteccion,
      titulo: item.plagaNombre,
      color: this.pinColor(item.severidad),
      campos: this.buildCampos([
        ['Tipo', item.tipoNombre || item.tipo],
        ['Cultivo', item.cultivoNombre || item.cultivo],
        ['Severidad', item.severidad],
        ['Estado', item.estado],
        ['Área afectada', item.areaAfectadaHa ? `${this.num(item.areaAfectadaHa)} ha` : ''],
        ['% afectado', item.porcentajeAfectado ? `${item.porcentajeAfectado} %` : ''],
        ['Responsable', item.responsable],
        ['Descripción', item.descripcion],
        ['Ubicación', item.latitud != null && item.longitud != null ? `${item.latitud}, ${item.longitud}` : ''],
        ['Precisión', item.precisionMetros ? `${item.precisionMetros} m` : ''],
        ['Origen', item.origenGeolocalizacion],
        ['Foto', item.fotoNombre],
        ['Registrado', this.fmtFecha(item.createdAt)],
      ]),
    };
  }

  private aplicacionEvento(item: AplicacionFitosanitaria): HistorialEvento {
    return {
      tipo: 'Aplicación',
      fecha: item.fechaAplicacion,
      titulo: item.producto,
      color: '#6EA8FF',
      campos: this.buildCampos([
        ['Principio activo', item.principioActivo],
        ['Dosis', `${this.num(item.dosis)} ${item.unidadDosis}`],
        ['Volumen caldo', item.volumenCaldoLHa ? `${this.num(item.volumenCaldoLHa)} L/ha` : ''],
        ['Superficie tratada', item.superficieTratadaHa ? `${this.num(item.superficieTratadaHa)} ha` : ''],
        ['Período carencia', item.periodoCarenciaDias ? `${item.periodoCarenciaDias} días` : ''],
        ['Período reingreso', item.periodoReingresoHoras ? `${item.periodoReingresoHoras} h` : ''],
        ['Reingreso seguro', this.fmtFecha(item.fechaReingresoSeguro)],
        ['Cosecha segura', this.fmtFecha(item.fechaCosechaSegura)],
        ['Condiciones', item.condicionesClimaticas],
        ['Responsable', item.operarioResponsable],
        ['Observaciones', item.observaciones],
        ['Registrado', this.fmtFecha(item.createdAt)],
      ]),
    };
  }

  private seguimientoEvento(item: SeguimientoPlaga): HistorialEvento {
    return {
      tipo: 'Seguimiento',
      fecha: item.fecha,
      titulo: item.plagaNombre,
      color: '#39D0D8',
      campos: this.buildCampos([
        ['Resultado', item.resultado],
        ['Severidad', item.severidad],
        ['Responsable', item.responsable],
        ['Observaciones', item.observaciones],
        ['Registrado', this.fmtFecha(item.createdAt)],
      ]),
    };
  }

  // ---- Helpers ----

  // Arma la lista de campos del evento descartando los que no tienen valor.
  private buildCampos(entries: Array<[string, string | number | null | undefined]>): HistorialCampo[] {
    return entries
      .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== '')
      .map(([label, value]) => ({ label, value: `${value}` }));
  }

  private fmtFecha(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(date);
  }

  private num(value?: number | null): string {
    return value === null || value === undefined ? '' : Number(value).toLocaleString('es-AR');
  }

  private pinColor(value?: SeveridadPlaga): string {
    return value === 'CRITICA' ? '#ff6b6b' : value === 'ALTA' ? '#ff8a4c' : value === 'MEDIA' ? '#ffb84d' : '#9fe870';
  }
}
