import { Coordinates } from '../types';

/**
 * Validates if coordinates are non-null and within valid Earth bounds.
 */
export function isValidCoordinates(coords?: Coordinates | null): coords is Coordinates {
  if (!coords) return false;
  const { latitude, longitude } = coords;
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

/**
 * Calculates straight-line distance in meters between two GPS coordinates using Haversine formula.
 */
export function getDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  if (!isValidCoordinates(coord1) || !isValidCoordinates(coord2)) return Infinity;

  const R = 6371000; // Earth radius in meters
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates straight-line distance in kilometers.
 */
export function getDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const meters = getDistanceMeters(coord1, coord2);
  return Math.round((meters / 1000) * 10) / 10;
}

/**
 * Calculates minimum distance in meters from a point P to a line segment AB.
 */
export function pointToSegmentDistanceMeters(
  p: Coordinates,
  a: Coordinates,
  b: Coordinates
): number {
  // Convert lat/lon to approximate Cartesian coordinates near point P for accurate projection
  const latRad = (p.latitude * Math.PI) / 180;
  const metersPerLat = 111139;
  const metersPerLon = 111139 * Math.cos(latRad);

  const px = p.longitude * metersPerLon;
  const py = p.latitude * metersPerLat;
  const ax = a.longitude * metersPerLon;
  const ay = a.latitude * metersPerLat;
  const bx = b.longitude * metersPerLon;
  const by = b.latitude * metersPerLat;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  // Projection scalar t along segment AB
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));

  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.hypot(px - projX, py - projY);
}

/**
 * Calculates minimum distance in meters from a point P to a polyline (array of Leaflet [lat, lng] points).
 */
export function pointToPolylineDistanceMeters(
  point: Coordinates,
  polyline: [number, number][]
): number {
  if (!isValidCoordinates(point) || polyline.length < 2) return Infinity;

  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const a: Coordinates = { latitude: polyline[i][0], longitude: polyline[i][1] };
    const b: Coordinates = { latitude: polyline[i + 1][0], longitude: polyline[i + 1][1] };
    const dist = pointToSegmentDistanceMeters(point, a, b);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}

/**
 * Computes bearing (heading) in degrees from point A to point B.
 */
export function calculateBearing(a: Coordinates, b: Coordinates): number {
  if (!isValidCoordinates(a) || !isValidCoordinates(b)) return 0;

  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;

  return (brng + 360) % 360;
}

/**
 * Formats distance in user-friendly Portuguese (e.g. "350 m" or "4,2 km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/**
 * Formats duration in seconds into Portuguese (e.g. "45 seg", "8 min" or "1h 12min").
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seg`;
  }
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
