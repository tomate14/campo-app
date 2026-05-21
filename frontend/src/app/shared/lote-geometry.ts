export type Point = {
  lat: number;
  lng: number;
};

export function toFiniteNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function sanitizePoints(points: Array<Partial<Point>>) {
  return points.filter((point): point is Point =>
    typeof point.lat === 'number' && Number.isFinite(point.lat) && typeof point.lng === 'number' && Number.isFinite(point.lng)
  );
}

export function parsePolygon(value?: string): Point[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as { type: string; coordinates?: number[][][] };
    if (parsed.type !== 'Polygon' || !Array.isArray(parsed.coordinates?.[0])) {
      return [];
    }

    return sanitizePoints(parsed.coordinates[0].slice(0, -1).map(([lng, lat]) => ({ lat, lng })));
  } catch {
    return [];
  }
}

export function buildPolygon(points: Point[]) {
  if (points.length < 3) {
    return undefined;
  }

  const coordinates = points.map((point) => [point.lng, point.lat]);
  coordinates.push([points[0].lng, points[0].lat]);
  return JSON.stringify({ type: 'Polygon', coordinates: [coordinates] });
}

export function computeCentroid(points: Point[]) {
  if (!points.length) {
    return {} as { lat?: number; lng?: number };
  }

  const total = points.reduce((accumulator, point) => ({ lat: accumulator.lat + point.lat, lng: accumulator.lng + point.lng }), {
    lat: 0,
    lng: 0,
  });

  return {
    lat: Number((total.lat / points.length).toFixed(7)),
    lng: Number((total.lng / points.length).toFixed(7)),
  };
}

export function computeAreaHectares(points: Point[]) {
  if (points.length < 3) {
    return undefined;
  }

  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6378137;
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += radians(next.lng - current.lng) * (2 + Math.sin(radians(current.lat)) + Math.sin(radians(next.lat)));
  }

  return Number((Math.abs((area * earthRadius * earthRadius) / 2) / 10000).toFixed(2));
}
