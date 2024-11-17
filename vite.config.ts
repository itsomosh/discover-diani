import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app'],
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-storage': ['firebase/storage'],
          'ui-core': ['framer-motion'],
          'ui-icons': ['lucide-react'],
          'ui-utils': ['react-hot-toast', 'react-select'],
          'maps': ['@react-google-maps/api'],
          'ai': ['@google/generative-ai', 'openai'],
          'date-utils': ['date-fns'],
          'analytics': ['mixpanel-browser'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      '@react-google-maps/api',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
});
