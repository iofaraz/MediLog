import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Plugin to copy migrations folder into build output
function copyMigrationsPlugin() {
  return {
    name: 'copy-migrations',
    closeBundle() {
      const src = resolve(__dirname, 'src/main/db/migrations');
      const dest = resolve(__dirname, 'out/main/db/migrations');

      function copyDir(srcDir: string, destDir: string) {
        mkdirSync(destDir, { recursive: true });
        for (const entry of readdirSync(srcDir)) {
          const srcPath = join(srcDir, entry);
          const destPath = join(destDir, entry);
          if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      }

      copyDir(src, dest);
    },
  };
}

export default defineConfig({
  main: {
    plugins: [copyMigrationsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
        },
      },
    },
  },
});
