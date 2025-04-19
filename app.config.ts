import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    preset: 'netlify',
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
    // @ts-ignore - Adding allowedHosts for ngrok
    server: {
      allowedHosts: ["basically-enough-clam.ngrok-free.app"],
    },
  },
});
