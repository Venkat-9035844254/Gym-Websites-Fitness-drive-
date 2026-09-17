import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fitnessdrive.gym",
  appName: "Fitness Drive Gym",
  webDir: "public",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#090d16",
      showSpinner: false,
    },
  },
};

export default config;
