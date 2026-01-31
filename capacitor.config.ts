import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.hardisk.blockmint',
  appName: 'BlockMint',
  webDir: 'dist/public',
  server: {
    // Development: Load from local dev server
    url: 'http://localhost:5000',
    cleartext: true,
    // Production: Uncomment these and comment out localhost
    // url: 'https://hardisk.co',
    // androidScheme: 'https',
    // iosScheme: 'https',
    // allowNavigation: ['hardisk.co', '*.hardisk.co'],
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
      resize: 'none',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
