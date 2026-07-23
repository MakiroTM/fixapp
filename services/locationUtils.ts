import { Coordinates } from '../types';

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using the Haversine formula.
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.max(0.3, Math.round(distance * 10) / 10);
}

/**
 * Generates a mock mechanic location near the given user location (offset by ~2km to 8km).
 */
export function generateNearbyMechanicCoords(userCoords: Coordinates): Coordinates {
  // Random offset in lat/lon (~0.015 to 0.05 degrees is ~1.5km to 5.5km)
  const angle = Math.random() * 2 * Math.PI;
  const distanceDeg = 0.015 + Math.random() * 0.035;
  
  return {
    latitude: userCoords.latitude + Math.sin(angle) * distanceDeg,
    longitude: userCoords.longitude + Math.cos(angle) * distanceDeg
  };
}

export interface ETACalculationResult {
  distanceKm: number;
  etaMinutes: number;
  formattedEta: string;
  trafficCondition: 'LIVRE' | 'MODERADO' | 'INTENSO';
  mechanicCoords: Coordinates;
}

/**
 * Computes dynamic ETA and traffic details based on user and mechanic location.
 */
export function calculateDynamicETA(
  userCoords?: Coordinates | null,
  mechanicCoords?: Coordinates | null
): ETACalculationResult {
  // Default fallback coords if user location is not active
  const defaultUserCoords: Coordinates = { latitude: -23.55052, longitude: -46.633308 }; // São Paulo default
  const actualUserCoords = userCoords || defaultUserCoords;

  const actualMechanicCoords = mechanicCoords || generateNearbyMechanicCoords(actualUserCoords);
  const distanceKm = calculateDistanceKm(actualUserCoords, actualMechanicCoords);

  // Urban routing factor ~ 1.3x road distance vs straight line
  const roadDistanceKm = Math.round(distanceKm * 1.3 * 10) / 10;

  // Average speed based on distance and traffic
  let trafficCondition: 'LIVRE' | 'MODERADO' | 'INTENSO' = 'LIVRE';
  if (distanceKm > 6) {
    trafficCondition = 'MODERADO';
  } else if (distanceKm < 2) {
    trafficCondition = 'LIVRE';
  } else {
    const randomTraffic = Math.random();
    trafficCondition = randomTraffic > 0.6 ? 'MODERADO' : 'LIVRE';
  }

  // Speed in km/h based on traffic
  const speedKmh = trafficCondition === 'LIVRE' ? 38 : trafficCondition === 'MODERADO' ? 28 : 18;
  
  // Calculate travel time in minutes + 3 min fixed dispatch preparation time
  const travelTimeMinutes = Math.max(3, Math.round((roadDistanceKm / speedKmh) * 60 + 3));

  let formattedEta = `${travelTimeMinutes} min`;
  if (travelTimeMinutes >= 60) {
    const hours = Math.floor(travelTimeMinutes / 60);
    const mins = travelTimeMinutes % 60;
    formattedEta = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  return {
    distanceKm: roadDistanceKm,
    etaMinutes: travelTimeMinutes,
    formattedEta,
    trafficCondition,
    mechanicCoords: actualMechanicCoords
  };
}
