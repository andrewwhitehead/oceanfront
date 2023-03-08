import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command, mode }) => {
  const node_env = process.env.NODE_ENV || 'development'
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'oceanfront-colorscheme-editor',
        // the proper extensions will be added
        fileName: 'oceanfront-colorscheme-editor',
      },
      define: {
        __DEV__: JSON.stringify(node_env === 'development'),
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
      },
      emptyOutDir: mode !== 'dev',
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['vue'],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'Vue',
          },
          // Rename combined CSS output from style.css
          assetFileNames: 'oceanfront-colorscheme-editor.[ext]',
        },
      },
      sourcemap: mode === 'dev',
    },
    plugins: [
      vue(),
      dts({
        rollupTypes: true,
      }),
    ],
  }
})
