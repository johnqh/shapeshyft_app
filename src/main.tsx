import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Initialize DI services BEFORE importing App
import { initializeStorageService, initializeNetworkService } from '@sudobility/di';
initializeStorageService();
initializeNetworkService();

// Initialize i18n
import './i18n';

// Import App AFTER DI initialization
import App from './App';

// Render React app
const root = document.getElementById('root')!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
