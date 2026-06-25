import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { Lote } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { parsePolygon } from '../../shared/lote-geometry';

@Component({
  selector: 'app-lote-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxMapLibreGLModule],
  templateUrl: './lote-detail-page.component.html',
  styleUrl: './lote-detail-page.component.css',
})
export class LoteDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agricolaService = inject(AgricolaService);

  protected lote?: Lote;
  protected readonly mapStyle = 'https://tiles.openfreemap.org/styles/bright';
  protected readonly fillPaint = { 'fill-color': '#4d7c0f', 'fill-opacity': 0.18 };
  protected readonly linePaint = { 'line-color': '#0891b2', 'line-width': 2.5 };
  protected zoom: [number] = [6];
  protected center: [number, number] = [-58.3816, -34.6037];
  protected mapData: any = { type: 'FeatureCollection', features: [] };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/agricola/lotes']);
      return;
    }

    this.load(id);
  }

  load(id: string) {
    this.agricolaService.getLote(id).subscribe((lote) => {
      this.lote = lote;
      this.syncMap();
    });
  }

  private syncMap() {
    if (!this.lote) {
      return;
    }

    const points = parsePolygon(this.lote.poligono);
    this.center = [this.lote.longitud ?? points[0]?.lng ?? -58.3816, this.lote.latitud ?? points[0]?.lat ?? -34.6037];
    this.zoom = [points.length ? 13 : 6];
    this.mapData = points.length >= 3
      ? {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[...points.map((point) => [point.lng, point.lat]), [points[0].lng, points[0].lat]]],
            },
          }],
        }
      : { type: 'FeatureCollection', features: [] };
  }
}

