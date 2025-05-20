import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  base: '/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  build: {
    target: 'esnext',
  },
  publicDir: './public',
  server: {
    allowedHosts: true,
    port: 3132,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});

