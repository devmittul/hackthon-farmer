import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router-dom')) return 'vendor';
            if (id.includes('mapbox') || id.includes('react-map-gl')) return 'mapbox';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('recharts')) return 'ui';
            return 'deps';
          }
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'] as any,
  }
} as any)
