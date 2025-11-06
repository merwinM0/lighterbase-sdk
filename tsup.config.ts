import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/lib/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  minify: true,
  target: 'es2022',
})