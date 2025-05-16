import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@walletconnect/core': resolve(__dirname, 'src/shims/walletConnectShims.js'),
      '@toruslabs/solana-embed': resolve(__dirname, 'src/shims/walletAdapterShims.js'),
      '@particle-network/auth': resolve(__dirname, 'src/shims/particleNetworkShims.js'),
      'bn.js': resolve(__dirname, 'node_modules/bn.js'),
      'bignumber.js': resolve(__dirname, 'node_modules/bignumber.js'),
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify',
    }
  },
  define: {
    'global': 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
    },
    include: [
      '@solana/web3.js',
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-wallets',
      'buffer'
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: []
    }
  }
})
