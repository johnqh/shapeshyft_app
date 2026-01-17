import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Initialize DI services BEFORE importing App
import {
  initializeStorageService,
  initializeNetworkService,
} from "@sudobility/di";
import { initializeInfoService } from "@sudobility/di_web";
import { initializeFirebaseAuth } from "@sudobility/auth_lib";
import { initializeSubscription } from "@sudobility/subscription_lib";
import {
  configureRevenueCatAdapter,
  createRevenueCatAdapter,
} from "./config/subscription-adapter";

initializeStorageService();
initializeNetworkService();
initializeInfoService();

// Initialize Firebase Auth
initializeFirebaseAuth({
  config: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },
});

// Initialize Subscription
configureRevenueCatAdapter(
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_REVENUECAT_API_KEY
    : import.meta.env.VITE_REVENUECAT_API_KEY_SANDBOX
);
initializeSubscription({
  adapter: createRevenueCatAdapter(),
  freeTier: { packageId: "free", name: "Free" },
});

// Initialize i18n
import "./i18n";

// Import App AFTER DI initialization
import App from "./App";

// Initialize performance monitoring
import { registerServiceWorker } from "./utils/serviceWorker";
import { initWebVitals } from "./utils/webVitals";

registerServiceWorker();
initWebVitals();

// Render React app
const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
