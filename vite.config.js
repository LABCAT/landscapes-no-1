import { defineConfig } from 'vite';
import inject from '@rollup/plugin-inject'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  base: './', // Use relative paths for all built assets
  resolve: {
    alias: {
      '@audio': path.resolve(__dirname, 'src/audio'),
      '@demos': path.resolve(__dirname, 'src/demos'),
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  plugins: [
    inject({
      p5: 'p5',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/audio/*.ogg',
          dest: 'audio',
        },
        {
          src: 'src/audio/*.mid',
          dest: 'audio',
        },
        {
          src: 'src/lib/fxhash.min.js',
          dest: 'lib',
        },
      ],
    }),
  ],
});
