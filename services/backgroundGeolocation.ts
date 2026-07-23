import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { Geolocation } from '@capacitor/geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number | null;
  time?: number;
}

export class BackgroundLocationManager {
  private static watcherId: string | null = null;
  private static webIntervalId: any = null;

  /**
   * Request necessary location permissions for background & foreground
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const status = await Geolocation.requestPermissions();
      return status.location === 'granted' || status.coarseLocation === 'granted';
    } catch (e) {
      console.warn('[BackgroundGeolocation] Geolocation permission error or web preview:', e);
      return true; // Fallback for web preview
    }
  }

  /**
   * Start tracking mechanic location in foreground and background (minimized/locked screen)
   */
  static async startTracking(
    onLocationUpdate: (coords: LocationCoordinates) => void
  ): Promise<string> {
    await this.requestPermissions();

    try {
      // Try Capacitor Background Geolocation Native Plugin
      const id = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'O aplicativo FIX está atualizando sua localização em segundo plano para enviar chamados próximos.',
          backgroundTitle: 'FIX Socorro 24h • Localização Ativa',
          requestPermissions: true,
          stale: false,
          distanceFilter: 10 // Update every 10 meters
        },
        (location, error) => {
          if (error) {
            console.error('[BackgroundGeolocation] Native Watcher Error:', error);
            return;
          }
          if (location) {
            console.log('[BackgroundGeolocation] New location received in background:', location.latitude, location.longitude);
            onLocationUpdate({
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
              speed: location.speed,
              time: location.time
            });
          }
        }
      );

      this.watcherId = id;
      console.log('[BackgroundGeolocation] Started native background watcher with ID:', id);
      return id;
    } catch (nativeErr) {
      console.warn('[BackgroundGeolocation] Native watcher failed or running in web preview. Starting Geolocation fallback watcher:', nativeErr);

      // Fallback 1: Geolocation watchPosition
      try {
        const watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000
          },
          (position) => {
            if (position) {
              onLocationUpdate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed,
                time: position.timestamp
              });
            }
          }
        );
        this.watcherId = `geo-${watchId}`;
        return this.watcherId;
      } catch (geoErr) {
        // Fallback 2: Web interval simulation for preview
        console.warn('[BackgroundGeolocation] Geolocation watchPosition error, using simulated updater for web preview:', geoErr);
        
        // Initial location
        onLocationUpdate({
          latitude: -23.5505,
          longitude: -46.6333,
          time: Date.now()
        });

        this.webIntervalId = setInterval(() => {
          // slight random jitter
          const latJitter = (Math.random() - 0.5) * 0.0004;
          const lngJitter = (Math.random() - 0.5) * 0.0004;
          onLocationUpdate({
            latitude: -23.5505 + latJitter,
            longitude: -46.6333 + lngJitter,
            time: Date.now()
          });
        }, 8000);

        this.watcherId = 'web-simulated-id';
        return this.watcherId;
      }
    }
  }

  /**
   * Stop background location tracking when mechanic goes offline
   */
  static async stopTracking(): Promise<void> {
    if (this.webIntervalId) {
      clearInterval(this.webIntervalId);
      this.webIntervalId = null;
    }

    if (!this.watcherId) return;

    try {
      if (this.watcherId.startsWith('geo-')) {
        const geoId = this.watcherId.replace('geo-', '');
        await Geolocation.clearWatch({ id: geoId });
      } else if (this.watcherId !== 'web-simulated-id') {
        await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      }
      console.log('[BackgroundGeolocation] Stopped tracking watcher ID:', this.watcherId);
    } catch (e) {
      console.error('[BackgroundGeolocation] Error removing watcher:', e);
    } finally {
      this.watcherId = null;
    }
  }
}
