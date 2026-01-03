import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import packageJson from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  server: {
    port: 5203,
  },
  resolve: {
    alias: {
      // Ensure all packages use the same React instance
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            if (id.includes('@sudobility')) {
              return 'vendor-sudobility';
            }
            if (id.includes('zustand')) {
              return 'vendor-zustand';
            }
            if (id.includes('revenuecat') || id.includes('purchases')) {
              return 'vendor-revenuecat';
            }
          }
        },
      },
    },
  },
})
