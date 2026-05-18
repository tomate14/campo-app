'use client'

import { useEffect, useRef } from 'react'
import type { Lote } from '@/lib/types/agricola'

interface Props {
  lote: Lote & { poligono?: string }
}

export function LoteMapTab({ lote }: Props) {
  const hasCoords = lote.latitud !== undefined && lote.longitud !== undefined
  const hasPolygon = !!lote.poligono
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasCoords || typeof window === 'undefined') return

    // Lazy-load Leaflet so it doesn't break SSR
    import('leaflet').then((L) => {
      if (!mapRef.current) return

      // Remove previous map instance if any
      const container = mapRef.current as HTMLElement & { _leaflet_id?: number }
      if (container._leaflet_id) return

      const map = L.map(mapRef.current).setView(
        [lote.latitud!, lote.longitud!],
        14
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      // Marker at centroid
      L.marker([lote.latitud!, lote.longitud!])
        .addTo(map)
        .bindPopup(`<strong>${lote.nombre}</strong><br/>${lote.area} ha`)
        .openPopup()

      // GeoJSON polygon if present
      if (hasPolygon) {
        try {
          const geoJson = JSON.parse(lote.poligono!)
          L.geoJSON(geoJson, {
            style: { color: '#2563EB', weight: 2, fillOpacity: 0.15 },
          }).addTo(map)
        } catch {
          // invalid JSON — skip polygon layer
        }
      }
    })
  }, [hasCoords, hasPolygon, lote])

  if (!hasCoords) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
        <p className="text-sm text-foreground/50">
          Este lote no tiene coordenadas definidas.
        </p>
        <p className="mt-1 text-xs text-foreground/40">
          Editá el lote para agregar latitud, longitud y/o polígono GeoJSON.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm text-foreground/60">
        <span>Lat: {lote.latitud}</span>
        <span>Lng: {lote.longitud}</span>
        {hasPolygon && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Polígono cargado</span>
        )}
      </div>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={mapRef} className="h-96 w-full rounded-xl border border-border overflow-hidden" />
    </div>
  )
}
