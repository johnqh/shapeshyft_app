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
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    // Only preload direct imports, not lazy-loaded chunks
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        // Don't preload lazy-loaded pages or heavy vendor chunks
        return deps.filter(dep =>
          !dep.includes('page-') &&
          !dep.includes('vendor-charts') &&
          !dep.includes('vendor-revenuecat') &&
          !dep.includes('vendor-ui')
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // Core React - loaded on every page
            if (id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Firebase - loaded only when auth needed
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // i18n
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            // TanStack Query
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            // Sudobility packages split by type
            if (id.includes('@sudobility/auth-components')) {
              return 'vendor-auth';
            }
            if (id.includes('@sudobility/subscription-components')) {
              return 'vendor-subscription';
            }
            if (id.includes('@sudobility/components') || id.includes('@sudobility/design')) {
              return 'vendor-ui';
            }
            if (id.includes('@sudobility/shapeshyft_client')) {
              return 'vendor-client';
            }
            if (id.includes('@sudobility/shapeshyft_lib')) {
              return 'vendor-lib';
            }
            if (id.includes('@sudobility/ratelimit_client') || id.includes('@sudobility/ratelimit_components')) {
              return 'vendor-ratelimit';
            }
            if (id.includes('@sudobility')) {
              return 'vendor-sudobility-misc';
            }
            // State management
            if (id.includes('zustand')) {
              return 'vendor-zustand';
            }
            // RevenueCat - lazy loaded
            if (id.includes('revenuecat') || id.includes('purchases')) {
              return 'vendor-revenuecat';
            }
            // Charts - only used on analytics page
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Helmet for SEO
            if (id.includes('react-helmet')) {
              return 'vendor-helmet';
            }
          }

          // Split dashboard pages into separate chunks
          if (id.includes('src/pages/dashboard/')) {
            const pageName = id.match(/dashboard\/(\w+)Page/)?.[1];
            if (pageName) {
              return `page-${pageName.toLowerCase()}`;
            }
          }

          // Split public pages
          if (id.includes('src/pages/') && !id.includes('dashboard')) {
            const pageName = id.match(/pages\/(\w+)Page/)?.[1];
            if (pageName) {
              return `page-${pageName.toLowerCase()}`;
            }
          }
        },
      },
    },
  },
})
