import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.guitartutor',
  appName: 'Guitar Tutor',
  webDir: 'dist',
  server: { androidScheme: 'https' }
};

export default config;
