import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import type { Marker, StyleSpecification } from 'maplibre-gl';
import { buildPolygon, computeAreaHectares, computeCentroid, parsePolygon, sanitizePoints, type Point } from '../lote-geometry';

@Component({
  selector: 'app-lote-map-editor',
  standalone: true,
  imports: [CommonModule, NgxMapLibreGLModule],
  templateUrl: './lote-map-editor.component.html',
  styleUrl: './lote-map-editor.component.css',
})
export class LoteMapEditorComponent implements OnChanges {
  @Input() value?: string;
  @Input() fallbackLat?: number;
  @Input() fallbackLng?: number;
  @Output() polygonChange = new EventEmitter<{ polygon?: string; centroid?: { lat?: number; lng?: number }; areaHa?: number }>();

  points: Point[] = [];
  polygonClosed = false;
  expanded = false;
  baseMapMode: 'mapa' | 'satelite' = 'mapa';
  zoom: [number] = [5];
  center: [number, number] = [-58.3816, -34.6037];
  centroid: { lat?: number; lng?: number } = {};
  areaHa?: number;

  readonly streetStyle = 'https://tiles.openfreemap.org/styles/bright';
  readonly satelliteStyle: StyleSpecification = {
    version: 8,
    sources: {
      satellite: {
        type: 'raster',
        tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg'],
        tileSize: 256,
        attribution: 'EOX Sentinel-2 cloudless',
      },
    },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
  };
  readonly fillPaint = { 'fill-color': '#4d7c0f', 'fill-opacity': 0.18 };
  readonly linePaint = { 'line-color': '#0891b2', 'line-width': 2.5 };

  get mapStyle() {
    return this.baseMapMode === 'mapa' ? this.streetStyle : this.satelliteStyle;
  }

  get polygonFeatureCollection(): FeatureCollection<Polygon> {
    const points = this.points.map((point) => [point.lng, point.lat] as [number, number]);
    if (points.length < 3) {
      return { type: 'FeatureCollection', features: [] };
    }

    const polygonFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [[...points, points[0]]] },
    };

    return {
      type: 'FeatureCollection',
      features: [polygonFeature],
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('value' in changes && this.value !== undefined) {
      this.points = parsePolygon(this.value);
      // El poligono solo debe cerrarse por accion explicita del usuario
      // (doble click), no por el rebote del valor serializado desde el form.
      this.polygonClosed = false;
      this.syncDerived(true);
    } else if ('fallbackLat' in changes || 'fallbackLng' in changes) {
      this.syncView(true);
    }
  }

  onMapClick(event: any) {
    if (this.polygonClosed) {
      return;
    }

    const lng = Number(event.lngLat.lng.toFixed(7));
    const lat = Number(event.lngLat.lat.toFixed(7));
    this.points = sanitizePoints([...this.points, { lat, lng }]);
    this.syncDerived(false);
  }

  onMapDoubleClick(event: any) {
    event.preventDefault?.();
    if (this.points.length >= 3) {
      this.polygonClosed = true;
      this.syncDerived(false);
    }
  }

  onMarkerDragEnd(index: number, marker: Marker) {
    const lngLat = marker.getLngLat();
    this.points = sanitizePoints(this.points.map((point, pointIndex) => pointIndex === index ? { lat: Number(lngLat.lat.toFixed(7)), lng: Number(lngLat.lng.toFixed(7)) } : point));
    this.syncDerived(false);
  }

  undo() {
    this.points = this.points.slice(0, -1);
    if (this.points.length < 3) {
      this.polygonClosed = false;
    }
    this.syncDerived(false);
  }

  clear() {
    this.points = [];
    this.polygonClosed = false;
    this.syncDerived(true);
    this.polygonChange.emit({ polygon: undefined, centroid: {}, areaHa: undefined });
  }

  private syncDerived(updateView: boolean) {
    this.centroid = computeCentroid(this.points);
    this.areaHa = computeAreaHectares(this.points);
    this.syncView(updateView);
    this.polygonChange.emit({ polygon: buildPolygon(this.points), centroid: this.centroid, areaHa: this.areaHa });
  }

  private syncView(forceUpdate: boolean) {
    if (!forceUpdate) {
      return;
    }

    if (this.points.length > 0) {
      const target = this.centroid.lat !== undefined && this.centroid.lng !== undefined
        ? [this.centroid.lng, this.centroid.lat] as [number, number]
        : [this.points[this.points.length - 1].lng, this.points[this.points.length - 1].lat] as [number, number];
      this.center = target;
      this.zoom = [14];
      return;
    }

    this.center = [this.fallbackLng ?? -58.3816, this.fallbackLat ?? -34.6037];
    this.zoom = [5];
  }
}

