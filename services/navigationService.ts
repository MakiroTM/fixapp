import { Coordinates } from '../types';
import { 
  isValidCoordinates, 
  getDistanceMeters, 
  pointToPolylineDistanceMeters, 
  formatDistance, 
  formatDuration 
} from '../utils/geo';
import { calculateRoute, CalculatedRouteResult, RouteStep } from './routingService';
import { locationService, UserLocationDetails } from './locationService';

export type NavigationStatus =
  | 'idle'
  | 'locating'
  | 'calculating'
  | 'navigating'
  | 'rerouting'
  | 'arrived'
  | 'gps_error'
  | 'route_error'
  | 'permission_denied';

export interface NavigationSessionState {
  status: NavigationStatus;
  destinationCoords: Coordinates | null;
  destinationTitle: string | null;
  destinationAddress?: string | null;
  userCoords: UserLocationDetails | null;
  route: CalculatedRouteResult | null;
  currentStepIndex: number;
  currentInstruction: string | null;
  distanceToNextManeuver: number | null; // meters
  remainingDistanceMeters: number | null;
  remainingDurationSeconds: number | null;
  formattedRemainingDistance: string | null;
  formattedRemainingDuration: string | null;
  offRouteDistanceMeters: number | null;
  errorMessage: string | null;
  isOffline: boolean;
}

type NavigationListener = (state: NavigationSessionState) => void;

const OFF_ROUTE_THRESHOLD_METERS = 50; // 50m off route threshold
const ARRIVAL_THRESHOLD_METERS = 30; // 30m arrival threshold
const REROUTE_COOLDOWN_MS = 10000; // 10s cooldown between recalculation calls

class NavigationService {
  private listeners: Set<NavigationListener> = new Set();

  private state: NavigationSessionState = {
    status: 'idle',
    destinationCoords: null,
    destinationTitle: null,
    destinationAddress: null,
    userCoords: null,
    route: null,
    currentStepIndex: 0,
    currentInstruction: null,
    distanceToNextManeuver: null,
    remainingDistanceMeters: null,
    remainingDurationSeconds: null,
    formattedRemainingDistance: null,
    formattedRemainingDuration: null,
    offRouteDistanceMeters: null,
    errorMessage: null,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  };

  private locationUnsubscribe: (() => void) | null = null;
  private isRecalculating = false;
  private lastRecalculateTime = 0;
  private abortController: AbortController | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnlineStatus);
      window.addEventListener('offline', this.handleOnlineStatus);
    }
  }

  private handleOnlineStatus = () => {
    const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    this.updateState({ isOffline });
  };

  public getState(): NavigationSessionState {
    return this.state;
  }

  public subscribe(listener: NavigationListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Start navigation towards destination.
   */
  public async startNavigation(
    destination: Coordinates,
    title: string,
    address?: string
  ): Promise<void> {
    if (!isValidCoordinates(destination)) {
      this.updateState({
        status: 'route_error',
        errorMessage: 'Este destino não possui localização válida.',
      });
      return;
    }

    // Reset previous route
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.updateState({
      status: 'calculating',
      destinationCoords: destination,
      destinationTitle: title,
      destinationAddress: address || null,
      errorMessage: null,
      route: null,
      currentStepIndex: 0,
    });

    // Subscribe to location updates if not subscribed
    if (!this.locationUnsubscribe) {
      this.locationUnsubscribe = locationService.subscribe((locState) => {
        this.handleUserLocationUpdate(locState.coords, locState.status, locState.errorMessage);
      });
    }

    const currentLoc = locationService.getState().coords;

    if (!currentLoc || !isValidCoordinates({ latitude: currentLoc.latitude, longitude: currentLoc.longitude })) {
      this.updateState({
        status: 'locating',
        errorMessage: 'Aguardando sinal do GPS para iniciar rota...',
      });
      return;
    }

    await this.fetchInitialRoute(currentLoc, destination);
  }

  private async fetchInitialRoute(userLoc: UserLocationDetails, dest: Coordinates): Promise<void> {
    try {
      this.updateState({ status: 'calculating', userCoords: userLoc });

      const routeResult = await calculateRoute(
        { latitude: userLoc.latitude, longitude: userLoc.longitude },
        dest,
        this.abortController?.signal
      );

      const initialInstruction = routeResult.steps[0]?.instruction || 'Siga em frente';

      this.updateState({
        status: 'navigating',
        route: routeResult,
        userCoords: userLoc,
        currentStepIndex: 0,
        currentInstruction: initialInstruction,
        distanceToNextManeuver: routeResult.steps[0]?.distanceMeters || null,
        remainingDistanceMeters: routeResult.distanceMeters,
        remainingDurationSeconds: routeResult.durationSeconds,
        formattedRemainingDistance: routeResult.formattedDistance,
        formattedRemainingDuration: routeResult.formattedDuration,
        errorMessage: null,
      });

      console.log('[DEBUG NavigationService] Route calculated successfully!', routeResult.formattedDistance);
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('[DEBUG NavigationService Route Error]', err);
      this.updateState({
        status: 'route_error',
        errorMessage: err?.message || 'Erro ao calcular rota até o destino.',
      });
    }
  }

  /**
   * Real-time location callback triggered by locationService watchPosition.
   */
  private handleUserLocationUpdate(
    coords: UserLocationDetails | null,
    locationStatus: string,
    gpsErrorMessage: string | null
  ) {
    if (!coords || !isValidCoordinates({ latitude: coords.latitude, longitude: coords.longitude })) {
      if (this.state.status === 'navigating' || this.state.status === 'calculating') {
        this.updateState({
          status: 'gps_error',
          errorMessage: gpsErrorMessage || 'Sinal de GPS temporariamente fraco ou indisponível.',
        });
      }
      return;
    }

    const userCoord: Coordinates = { latitude: coords.latitude, longitude: coords.longitude };

    // If we were waiting for GPS location or in gps_error state
    if ((this.state.status === 'locating' || this.state.status === 'gps_error') && this.state.destinationCoords) {
      this.updateState({ status: 'calculating', userCoords: coords, errorMessage: null });
      this.fetchInitialRoute(coords, this.state.destinationCoords);
      return;
    }

    if (this.state.status !== 'navigating' && this.state.status !== 'rerouting') {
      this.updateState({ userCoords: coords });
      return;
    }

    const dest = this.state.destinationCoords;
    if (!dest) return;

    // 1. CHECK ARRIVAL (< 30 meters from destination)
    const distanceToDestination = getDistanceMeters(userCoord, dest);

    if (distanceToDestination <= ARRIVAL_THRESHOLD_METERS) {
      console.log('[DEBUG NavigationService] ARRIVED AT DESTINATION! Distance:', distanceToDestination);
      this.updateState({
        status: 'arrived',
        userCoords: coords,
        remainingDistanceMeters: 0,
        remainingDurationSeconds: 0,
        formattedRemainingDistance: '0 m',
        formattedRemainingDuration: 'Chegou',
        currentInstruction: 'Você chegou ao seu destino!',
      });
      return;
    }

    // 2. CHECK OFF-ROUTE (> 50 meters from route polyline)
    if (this.state.route && this.state.route.geometry.length > 1) {
      const offRouteDist = pointToPolylineDistanceMeters(userCoord, this.state.route.geometry);

      console.log('[DEBUG NavigationService] GPS Tick Off-Route Check:', {
        offRouteDist: Math.round(offRouteDist),
        distanceToDest: Math.round(distanceToDestination),
      });

      if (offRouteDist > OFF_ROUTE_THRESHOLD_METERS && !this.isRecalculating) {
        const now = Date.now();
        if (now - this.lastRecalculateTime > REROUTE_COOLDOWN_MS && !this.state.isOffline) {
          console.warn('[DEBUG NavigationService] User off-route (>50m). Triggering automatic reroute...');
          this.recalculateRoute(coords, dest, offRouteDist);
          return;
        }
      }

      // 3. UPDATE REMAINING DISTANCE & STEP INSTRUCTIONS
      this.updateStepProgress(coords, distanceToDestination, offRouteDist);
    } else {
      this.updateState({ userCoords: coords });
    }
  }

  /**
   * Recalculates route when user goes off-route (>50m).
   */
  private async recalculateRoute(
    userLoc: UserLocationDetails,
    dest: Coordinates,
    offRouteDist: number
  ) {
    if (this.isRecalculating) return;

    this.isRecalculating = true;
    this.lastRecalculateTime = Date.now();

    this.updateState({
      status: 'rerouting',
      userCoords: userLoc,
      offRouteDistanceMeters: Math.round(offRouteDist),
    });

    try {
      const newRoute = await calculateRoute(
        { latitude: userLoc.latitude, longitude: userLoc.longitude },
        dest
      );

      const newInstruction = newRoute.steps[0]?.instruction || 'Siga em frente na nova rota';

      this.updateState({
        status: 'navigating',
        route: newRoute,
        userCoords: userLoc,
        currentStepIndex: 0,
        currentInstruction: newInstruction,
        distanceToNextManeuver: newRoute.steps[0]?.distanceMeters || null,
        remainingDistanceMeters: newRoute.distanceMeters,
        remainingDurationSeconds: newRoute.durationSeconds,
        formattedRemainingDistance: newRoute.formattedDistance,
        formattedRemainingDuration: newRoute.formattedDuration,
        offRouteDistanceMeters: null,
        errorMessage: null,
      });

      console.log('[DEBUG NavigationService] Automatic reroute success!');
    } catch (err: any) {
      console.warn('[DEBUG NavigationService Reroute failed]', err?.message);
      // Fallback: maintain previous route, notify user
      this.updateState({
        status: 'navigating', // revert to navigating with existing route
        errorMessage: 'Recálculo automático indisponível temporariamente. Mantendo última rota.',
      });
    } finally {
      this.isRecalculating = false;
    }
  }

  /**
   * Advances step index and calculates distance to next maneuver step.
   */
  private updateStepProgress(
    userLoc: UserLocationDetails,
    distanceToDestination: number,
    offRouteDist: number
  ) {
    const route = this.state.route;
    if (!route || route.steps.length === 0) return;

    let stepIndex = this.state.currentStepIndex;
    const currentStep = route.steps[stepIndex];

    let distanceToNextManeuver: number | null = null;

    if (currentStep && currentStep.location[0] !== 0) {
      const stepCoord: Coordinates = {
        latitude: currentStep.location[0],
        longitude: currentStep.location[1],
      };
      distanceToNextManeuver = getDistanceMeters(
        { latitude: userLoc.latitude, longitude: userLoc.longitude },
        stepCoord
      );

      // If user passed maneuver point (<25 meters), advance to next step
      if (distanceToNextManeuver < 25 && stepIndex < route.steps.length - 1) {
        stepIndex += 1;
        console.log('[DEBUG NavigationService] Advanced to step index:', stepIndex);
      }
    }

    const activeStep = route.steps[stepIndex] || currentStep;
    const currentInstruction = activeStep?.instruction || 'Siga em frente';

    // Estimate remaining duration proportionally based on remaining distance
    const distRatio = Math.max(0, Math.min(1, distanceToDestination / (route.distanceMeters || 1)));
    const remainingDurationSec = Math.round(route.durationSeconds * distRatio);

    this.updateState({
      userCoords: userLoc,
      currentStepIndex: stepIndex,
      currentInstruction,
      distanceToNextManeuver: distanceToNextManeuver !== null ? Math.round(distanceToNextManeuver) : null,
      remainingDistanceMeters: Math.round(distanceToDestination),
      remainingDurationSeconds: remainingDurationSec,
      formattedRemainingDistance: formatDistance(distanceToDestination),
      formattedRemainingDuration: formatDuration(remainingDurationSec),
      offRouteDistanceMeters: Math.round(offRouteDist),
    });
  }

  /**
   * Force manual recalculation.
   */
  public async forceRecalculate(): Promise<void> {
    const { userCoords, destinationCoords } = this.state;
    if (userCoords && destinationCoords) {
      this.lastRecalculateTime = 0; // bypass cooldown
      await this.recalculateRoute(userCoords, destinationCoords, 0);
    }
  }

  /**
   * Stop active navigation session.
   */
  public stopNavigation(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.locationUnsubscribe) {
      this.locationUnsubscribe();
      this.locationUnsubscribe = null;
    }

    this.updateState({
      status: 'idle',
      destinationCoords: null,
      destinationTitle: null,
      destinationAddress: null,
      route: null,
      currentStepIndex: 0,
      currentInstruction: null,
      distanceToNextManeuver: null,
      remainingDistanceMeters: null,
      remainingDurationSeconds: null,
      formattedRemainingDistance: null,
      formattedRemainingDuration: null,
      offRouteDistanceMeters: null,
      errorMessage: null,
    });
  }

  private updateState(partial: Partial<NavigationSessionState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const navigationService = new NavigationService();
