import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Live portal that serves the Power Pages Web API (/_api). Override via
  // VITE_PORTAL_URL in a gitignored .env.local when targeting another env.
  const portalUrl = env.VITE_PORTAL_URL || 'https://mwcp26-agenda.powerappsportals.com'

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    server: {
      proxy: {
        // Forward portal Web API calls to the deployed site during local dev.
        // Anonymous-read tables → no cookie/CSRF needed for GETs.
        '/_api': {
          target: portalUrl,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
