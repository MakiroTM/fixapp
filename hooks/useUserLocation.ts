import { useState, useEffect } from 'react';
import { locationService, LocationState } from '../services/locationService';

export function useUserLocation(): LocationState & {
  refetch: () => void;
} {
  const [state, setState] = useState<LocationState>(locationService.getState());

  useEffect(() => {
    const unsubscribe = locationService.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refetch = () => {
    locationService.stopTracking();
    locationService.startTracking();
  };

  return {
    ...state,
    refetch,
  };
}
