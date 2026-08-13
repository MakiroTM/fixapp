import { Coordinates } from '../types';
import { isValidCoordinates, calculateBearing } from '../utils/geo';

export interface UserLocationDetails {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type LocationStatus = 
  | 'idle' 
  | 'locating' 
  | 'active' 
  | 'permission_denied' 
  | 'gps_error';

export interface LocationState {
  coords: UserLocationDetails | null;
  status: LocationStatus;
  errorMessage: string | null;
}

type LocationListener = (state: LocationState) => void;

class LocationService {
  private watchId: number | null = null;
  private listeners: Set<LocationListener> = new Set();
  private state: LocationState = {
    coords: null,
    status: 'idle',
    errorMessage: null,
  };
  private lastCoords: UserLocationDetails | null = null;

  public getState(): LocationState {
    return this.state;
  }

  public subscribe(listener: LocationListener): () => void {
    this.listeners.add(listener);
    // Send immediate current state
    listener(this.state);

    // If tracking not started and not in error, start
    if (this.watchId === null && this.state.status !== 'permission_denied') {
      this.startTracking();
    }

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.stopTracking();
      }
    };
  }

  public async startTracking(): Promise<void> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.updateState({
        status: 'gps_error',
        errorMessage: 'Geolocalização não é suportada neste navegador.',
      });
      return;
    }

    // Avoid duplicate watchers
    if (this.watchId !== null) return;

    this.updateState({ status: 'locating', errorMessage: null });

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000,
    };

    console.log('[DEBUG LocationService] Starting single watchPosition tracking...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, heading, speed } = position.coords;

        if (!isValidCoordinates({ latitude, longitude })) {
          return;
        }

        // Infer heading from consecutive movements if native heading is null
        let calculatedHeading = heading;
        if (
          (calculatedHeading === null || isNaN(calculatedHeading)) &&
          this.lastCoords &&
          speed && speed > 0.5
        ) {
          calculatedHeading = calculateBearing(
            { latitude: this.lastCoords.latitude, longitude: this.lastCoords.longitude },
            { latitude, longitude }
          );
        }

        const newCoords: UserLocationDetails = {
          latitude,
          longitude,
          accuracy: accuracy || null,
          heading: calculatedHeading,
          speed: speed || null,
          timestamp: position.timestamp || Date.now(),
        };

        this.lastCoords = newCoords;

        this.updateState({
          coords: newCoords,
          status: 'active',
          errorMessage: null,
        });
      },
      (error) => {
        console.warn('[DEBUG LocationService Error]', error.code, error.message);

        let status: LocationStatus = 'gps_error';
        let errorMessage = 'Localização indisponível.';

        if (error.code === error.PERMISSION_DENIED) {
          status = 'permission_denied';
          errorMessage = 'Permissão de localização negada pelo usuário.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Sinal de GPS indisponível.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Tempo esgotado ao tentar obter localização GPS.';
        }

        // Keep last valid coords if available, but mark status and errorMessage
        this.updateState({
          coords: this.lastCoords, // keeps last known position or null
          status,
          errorMessage,
        });
      },
      options
    );
  }

  public stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      console.log('[DEBUG LocationService] Clearing watchPosition ID:', this.watchId);
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.updateState({ status: 'idle' });
    }
  }

  private updateState(partial: Partial<LocationState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const locationService = new LocationService();
