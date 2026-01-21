import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.hardisk.blockmint',
  appName: 'BlockMint',
  webDir: 'dist/public',
  server: {
    // Production server URL - app loads from your hosted server
    // This ensures API calls with relative paths (/api/...) work correctly
    url: 'https://hardisk.co',
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow navigation to external URLs
    allowNavigation: ['hardisk.co', '*.hardisk.co'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#0a0a0f',
    scheme: 'BlockMint',
  },
  android: {
    backgroundColor: '#0a0a0f',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0f',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
