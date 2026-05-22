import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Lote, LoteRequest } from '../../core/models/agricola.models';
import { LoteMapEditorComponent } from '../lote-map-editor/lote-map-editor.component';

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LoteMapEditorComponent],
  templateUrl: './lote-form.component.html',
  styleUrl: './lote-form.component.css',
})
export class LoteFormComponent implements OnChanges {
  @Input() lote?: Lote | null;
  @Output() save = new EventEmitter<LoteRequest>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly cultivos = ['SOJA', 'MAIZ', 'TRIGO', 'GIRASOL', 'SORGO', 'OTRO'];
  protected model: LoteRequest = this.createEmptyModel();

  ngOnChanges(changes: SimpleChanges) {
    if ('lote' in changes) {
      this.model = this.lote
        ? {
            nombre: this.lote.nombre,
            area: this.lote.area,
            cultivo: this.lote.cultivo,
            temporada: this.lote.temporada,
            latitud: this.lote.latitud,
            longitud: this.lote.longitud,
            poligono: this.lote.poligono,
            phMinimo: this.lote.phMinimo,
            phMaximo: this.lote.phMaximo,
            fechaSiembra: this.lote.fechaSiembra,
            fechaCosechaEstimada: this.lote.fechaCosechaEstimada,
          }
        : this.createEmptyModel();
    }
  }

  onPolygonChange(event: { polygon?: string; centroid?: { lat?: number; lng?: number }; areaHa?: number }) {
    this.model.poligono = event.polygon;

    if (event.centroid?.lat !== undefined) {
      this.model.latitud = event.centroid.lat;
    }

    if (event.centroid?.lng !== undefined) {
      this.model.longitud = event.centroid.lng;
    }

    if (event.areaHa !== undefined) {
      this.model.area = event.areaHa;
    }
  }

  submit() {
    this.save.emit({ ...this.model, area: Number(this.model.area) });
  }

  private createEmptyModel(): LoteRequest {
    return {
      nombre: '',
      area: 0,
      cultivo: '',
      temporada: '',
      poligono: undefined,
      phMinimo: undefined,
      phMaximo: undefined,
      fechaSiembra: undefined,
      fechaCosechaEstimada: undefined,
    };
  }
}

