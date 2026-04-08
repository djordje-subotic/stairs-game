import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stackoblock.game',
  appName: 'STACKO',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#06060c',
    scrollEnabled: false,
    allowsLinkPreview: false,
  },
  android: {
    backgroundColor: '#06060c',
  },
};

export default config;
