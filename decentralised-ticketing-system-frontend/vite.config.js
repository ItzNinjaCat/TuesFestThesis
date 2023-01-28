import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
export default defineConfig({
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
    },
    plugins: [
        react(),
        tsconfigPaths(),
        eslint(),
        svgrPlugin({
            svgrOptions: {
                icon: true,
            },
        }),
    ],
});
