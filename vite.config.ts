import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'framer': ['framer-motion'],
          'firebase': ['firebase/app', 'firebase/auth'],
          'charts': ['recharts'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
  server: {
    hmr: {
      overlay: false,
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
    watch: {
      usePolling: false,
    },
  },
});
