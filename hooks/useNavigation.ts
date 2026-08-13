import { useState, useEffect } from 'react';
import { navigationService, NavigationSessionState } from '../services/navigationService';
import { Coordinates } from '../types';

export function useNavigation() {
  const [navState, setNavState] = useState<NavigationSessionState>(navigationService.getState());

  useEffect(() => {
    const unsubscribe = navigationService.subscribe((newState) => {
      setNavState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const startNavigation = (destination: Coordinates, title: string, address?: string) => {
    navigationService.startNavigation(destination, title, address);
  };

  const stopNavigation = () => {
    navigationService.stopNavigation();
  };

  const forceRecalculate = () => {
    navigationService.forceRecalculate();
  };

  return {
    ...navState,
    startNavigation,
    stopNavigation,
    forceRecalculate,
  };
}
