import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

const ReactCompilerConfig = {
  target: '19',
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@mui/material': '@mui/joy'
    }
  },
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ]
      }
    }),
  ],
})
