import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function removeConsoleCalls(source: string): string {
  const pattern = /\bconsole\.(?:log|debug|info|warn|error|trace|dir|table)\s*\(/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const start = match.index;
    let idx = pattern.lastIndex;
    let depth = 1;
    let inString: string | null = null;

    while (idx < source.length && depth > 0) {
      const ch = source[idx];
      if (inString) {
        if (ch === '\\') {
          idx += 2;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
      } else {
        if (ch === "'" || ch === '"' || ch === '`') {
          inString = ch;
        } else if (ch === '(') {
          depth++;
        } else if (ch === ')') {
          depth--;
        }
      }
      idx++;
    }

    if (depth === 0) {
      result += source.slice(lastIndex, start) + '(void 0)';
      lastIndex = idx;
      pattern.lastIndex = idx;
    }
  }

  result += source.slice(lastIndex);
  return result.replace(/\bdebugger\s*;?/g, '');
}

function stripConsoleAndCommentsPlugin(): Plugin {
  return {
    name: 'strip-console-and-comments',
    apply: 'build',
    transform(code, id) {
      if (!/\.[jt]sx?$/.test(id) && !/\.mjs$/.test(id)) return null;
      return { code: removeConsoleCalls(code), map: null };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripConsoleAndCommentsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    cssMinify: true,
  },
});
