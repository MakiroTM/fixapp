import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fix.app',
  appName: 'FIX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
