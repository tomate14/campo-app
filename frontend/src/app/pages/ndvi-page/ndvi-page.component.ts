import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import { forkJoin } from 'rxjs';
import type { Lote, NdviManifestItem } from '../../core/models/agricola.models';
import { AgricolaService } from '../../core/services/agricola.service';
import { parsePolygon } from '../../shared/lote-geometry';

type NdviViewerMode = 'satelite' | 'mapa' | 'hibrido' | 'terreno' | 'ndvi';

@Component({
  selector: 'app-ndvi-page',
  standalone: true,
  imports: [CommonModule, NgxMapLibreGLModule],
  templateUrl: './ndvi-page.component.html',
  styleUrl: './ndvi-page.component.css',
})
export class NdviPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agricolaService = inject(AgricolaService);

  protected readonly lote = signal<Lote | null>(null);
  protected readonly manifest = signal<NdviManifestItem | null>(null);
  protected readonly imageUrl = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly mapMode = signal<NdviViewerMode>('ndvi');

  protected readonly satelliteStyle: StyleSpecification = {
    version: 8,
    sources: { satellite: { type: 'raster', tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'], tileSize: 256, attribution: 'EOX Sentinel-2 cloudless' } },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
  };
  protected readonly terrainStyle: StyleSpecification = {
    version: 8,
    sources: { terrain: { type: 'raster', tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: 'OpenTopoMap' } },
    layers: [{ id: 'terrain', type: 'raster', source: 'terrain' }],
  };
  protected readonly mapStyle = computed(() => {
    if (this.mapMode() === 'mapa') return 'https://tiles.openfreemap.org/styles/bright';
    if (this.mapMode() === 'terreno') return this.terrainStyle;
    return this.satelliteStyle;
  });
  protected readonly center = computed<[number, number]>(() => {
    const points = parsePolygon(this.lote()?.poligono);
    if (!points.length) return [-60.6735049, -36.1966878];
    return [points.reduce((sum, point) => sum + point.lng, 0) / points.length, points.reduce((sum, point) => sum + point.lat, 0) / points.length];
  });
  protected readonly coordinates = computed<[[number, number], [number, number], [number, number], [number, number]] | null>(() => {
    const points = parsePolygon(this.lote()?.poligono);
    if (points.length < 3) return null;
    const west = Math.min(...points.map((point) => point.lng));
    const east = Math.max(...points.map((point) => point.lng));
    const south = Math.min(...points.map((point) => point.lat));
    const north = Math.max(...points.map((point) => point.lat));
    return [[west, north], [east, north], [east, south], [west, south]];
  });

  constructor() {
    const loteId = this.route.snapshot.paramMap.get('id');
    if (!loteId) {
      this.error.set('No se indicó el lote.');
      this.loading.set(false);
      return;
    }
    forkJoin({ lote: this.agricolaService.getLote(loteId), manifest: this.agricolaService.getNdviManifest() }).subscribe({
      next: ({ lote, manifest }) => {
        this.lote.set(lote);
        const item = manifest.find((candidate) => candidate.loteId === loteId) ?? null;
        this.manifest.set(item);
        if (!item?.disponible) {
          this.loading.set(false);
          return;
        }
        this.agricolaService.getNdviImage(loteId).subscribe({
          next: (blob) => {
            this.imageUrl.set(URL.createObjectURL(blob));
            this.loading.set(false);
          },
          error: () => {
            this.error.set('No se pudo descargar la imagen NDVI.');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se pudo cargar el visor NDVI.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    const url = this.imageUrl();
    if (url) URL.revokeObjectURL(url);
  }

  protected back(): void { void this.router.navigate(['/agricola/lotes']); }
  protected formatDate(value: string | null | undefined): string {
    return value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin fecha';
  }
}

