import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
export default defineConfig({
  optimizeDeps: {
      esbuildOptions: {
          define: {
              global: 'globalThis'
          },
          plugins: [
              NodeGlobalsPolyfillPlugin({
                  buffer: true
              })
          ]
      }
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    rollupOptions: {
        output:{
            manualChunks(id) {
                if (id.includes('node_modules')) {
                    return id.toString().split('node_modules/')[1].split('/')[0].toString();
                }
            }
        }
    }
  },
  plugins: [react({ plugins: [["@swc/plugin-styled-components", {}]] })],
})
