import { Coordinates } from '../types';
import { isValidCoordinates, formatDistance, formatDuration } from '../utils/geo';

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  formattedDistance: string;
  streetName: string;
  type: string;
  modifier?: string;
  location: [number, number]; // [lat, lng]
}

export interface CalculatedRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  formattedDistance: string;
  formattedDuration: string;
  geometry: [number, number][]; // Array of [lat, lng] for Leaflet Polyline
  steps: RouteStep[];
}

/**
 * Translates OSRM step maneuvers into user-friendly Portuguese instructions.
 */
function parseManeuverInstruction(
  type: string,
  modifier: string | undefined,
  streetName: string,
  distanceMeters: number
): string {
  const streetPart = streetName && streetName.trim() ? ` na ${streetName}` : '';
  const distPart = distanceMeters > 0 ? ` em ${formatDistance(distanceMeters)}` : '';

  switch (type) {
    case 'depart':
      return `Siga em frente${streetPart}`;
    case 'arrive':
      return 'Você chegará ao destino';
    case 'turn':
      if (modifier === 'right') return `Vire à direita${distPart}${streetPart}`;
      if (modifier === 'left') return `Vire à esquerda${distPart}${streetPart}`;
      if (modifier === 'slight right') return `Mantenha-se à direita${distPart}${streetPart}`;
      if (modifier === 'slight left') return `Mantenha-se à esquerda${distPart}${streetPart}`;
      if (modifier === 'sharp right') return `Curva acentuada à direita${distPart}${streetPart}`;
      if (modifier === 'sharp left') return `Curva acentuada à esquerda${distPart}${streetPart}`;
      return `Vire${distPart}${streetPart}`;
    case 'new name':
      return `Continue na ${streetName || 'via'}`;
    case 'end of road':
      if (modifier === 'right') return `No fim da via, vire à direita${streetPart}`;
      if (modifier === 'left') return `No fim da via, vire à esquerda${streetPart}`;
      return `No fim da via, continue em frente${streetPart}`;
    case 'continue':
    case 'straight':
      return `Siga em frente${distPart}${streetPart}`;
    case 'roundabout':
    case 'rotary':
      return `Entre na rotatória${streetPart}`;
    case 'fork':
      if (modifier?.includes('right')) return `Mantenha-se à direita na bifurcação${streetPart}`;
      if (modifier?.includes('left')) return `Mantenha-se à esquerda na bifurcação${streetPart}`;
      return `Siga na bifurcação${streetPart}`;
    case 'off ramp':
    case 'on ramp':
      return `Pegue a saída/alça de acesso${streetPart}`;
    default:
      if (modifier === 'right') return `Vire à direita${streetPart}`;
      if (modifier === 'left') return `Vire à esquerda${streetPart}`;
      return `Siga em frente${streetPart}`;
  }
}

/**
 * Calls OSRM REST endpoint to calculate real driving route between origin and destination.
 */
export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates,
  signal?: AbortSignal
): Promise<CalculatedRouteResult> {
  if (!isValidCoordinates(origin)) {
    throw new Error('Não foi possível obter sua localização atual.');
  }

  if (!isValidCoordinates(destination)) {
    throw new Error('Este destino não possui localização válida.');
  }

  // OSRM format: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson&steps=true`;

  console.log('[DEBUG RoutingService] Requesting OSRM route:', {
    origin: `${origin.latitude}, ${origin.longitude}`,
    destination: `${destination.latitude}, ${destination.longitude}`,
    url
  });

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Erro ao consultar serviço de rotas OSRM (${response.status})`);
  }

  const data = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Nenhuma rota encontrada para o destino selecionado.');
  }

  const route = data.routes[0];
  const distanceMeters = route.distance;
  const durationSeconds = route.duration;

  // Convert GeoJSON geometry [lng, lat] -> Leaflet Polyline [lat, lng]
  const rawCoords: [number, number][] = route.geometry?.coordinates || [];
  const geometry: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

  // Parse OSRM steps
  const steps: RouteStep[] = [];
  if (route.legs && route.legs[0] && route.legs[0].steps) {
    route.legs[0].steps.forEach((osrmStep: any) => {
      const maneuver = osrmStep.maneuver || {};
      const streetName = osrmStep.name || '';
      const stepDist = osrmStep.distance || 0;
      const stepDur = osrmStep.duration || 0;
      const stepLoc: [number, number] = maneuver.location
        ? [maneuver.location[1], maneuver.location[0]]
        : [0, 0];

      const instruction = parseManeuverInstruction(
        maneuver.type,
        maneuver.modifier,
        streetName,
        stepDist
      );

      steps.push({
        instruction,
        distanceMeters: stepDist,
        durationSeconds: stepDur,
        formattedDistance: formatDistance(stepDist),
        streetName,
        type: maneuver.type,
        modifier: maneuver.modifier,
        location: stepLoc,
      });
    });
  }

  return {
    distanceMeters,
    durationSeconds,
    formattedDistance: formatDistance(distanceMeters),
    formattedDuration: formatDuration(durationSeconds),
    geometry,
    steps,
  };
}
