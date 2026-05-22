import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { StyleSpecification } from 'maplibre-gl';
import { computeCentroid, parsePolygon } from '../lote-geometry';

@Component({
  selector: 'app-lote-map-preview',
  standalone: true,
  imports: [CommonModule, NgxMapLibreGLModule],
  templateUrl: './lote-map-preview.component.html',
  styleUrl: './lote-map-preview.component.css',
})
export class LoteMapPreviewComponent implements OnChanges {
  private static nextId = 0;
  private readonly instanceId = LoteMapPreviewComponent.nextId++;

  @Input() polygon?: string;
  @Input() lat?: number;
  @Input() lng?: number;
  @Input() compact = false;

  protected readonly sourceId = `preview-source-${this.instanceId}`;
  protected readonly glowLayerId = `preview-glow-${this.instanceId}`;
  protected readonly fillLayerId = `preview-fill-${this.instanceId}`;
  protected readonly lineLayerId = `preview-line-${this.instanceId}`;

  protected readonly streetStyle: StyleSpecification = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: 'OpenStreetMap',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
  protected readonly mapStyle: StyleSpecification = {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Esri World Imagery',
      },
    },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
  };
  protected readonly fillPaint = { 'fill-color': '#9FE870', 'fill-opacity': 0.14 };
  protected readonly glowPaint = { 'line-color': '#9FE870', 'line-width': 7, 'line-opacity': 0.18 };
  protected readonly linePaint = { 'line-color': '#9FE870', 'line-width': 2.2 };
  protected readonly minZoom = 4;
  protected readonly maxZoom = 18;
  protected mapMode: 'satelite' | 'mapa' = 'satelite';
  protected center: [number, number] = [-58.3816, -34.6037];
  protected zoom: [number] = [5];
  protected mapData: any = { type: 'FeatureCollection', features: [] };
  protected hasPolygon = false;

  protected get activeMapStyle() {
    return this.mapMode === 'satelite' ? this.mapStyle : this.streetStyle;
  }

  ngOnChanges(_: SimpleChanges) {
    const points = parsePolygon(this.polygon);
    this.hasPolygon = points.length >= 3;

    if (this.hasPolygon) {
      const centroid = computeCentroid(points);
      this.center = [centroid.lng ?? points[0].lng, centroid.lat ?? points[0].lat];
      this.zoom = [13];
      this.mapData = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[...points.map((point) => [point.lng, point.lat]), [points[0].lng, points[0].lat]]],
          },
        }],
      };
      return;
    }

    this.center = [this.lng ?? -58.3816, this.lat ?? -34.6037];
    this.zoom = [this.lat !== undefined && this.lng !== undefined ? 11 : 5];
    this.mapData = { type: 'FeatureCollection', features: [] };
  }

  protected zoomIn() {
    this.zoom = [Math.min(this.maxZoom, this.zoom[0] + 1)];
  }

  protected zoomOut() {
    this.zoom = [Math.max(this.minZoom, this.zoom[0] - 1)];
  }

  protected setMapMode(mode: 'satelite' | 'mapa') {
    this.mapMode = mode;
  }
}
