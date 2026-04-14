import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Local dev only — points to backend running on your machine.
        // In production the VITE_API_URL env var is used instead (no proxy needed).
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  test: {
    // Make vi/describe/it/expect available globally (no imports needed in test files)
    globals: true,
    // Use jsdom to simulate a browser environment
    environment: 'jsdom',
    // Run this file before each test suite
    setupFiles: ['./src/test/setup.js'],
    // Exclude node_modules and build output
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Which files to measure
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/test/**',
        'src/**/__tests__/**',
        // App.jsx is pure routing — no logic to unit-test
        'src/App.jsx',
        // Complex data-display pages: their modal/interaction code is better
        // covered by integration/e2e tests (Playwright/Cypress) than unit tests.
        'src/pages/DashboardPage.jsx',
        'src/pages/GoalsPage.jsx',
        'src/pages/WalletPage.jsx',
        'src/pages/PortfolioPage.jsx',
        'src/pages/SavingsTrackerPage.jsx',
        'src/pages/TransactionsPage.jsx',
      ],
      thresholds: {
        lines:      70,
        // Inline event handlers (onMouseEnter, scroll, etc.) count as uncovered
        // functions but are better exercised by e2e tests — threshold set accordingly.
        functions:  40,
        branches:   60,
        statements: 70,
      },
    },
  },
});
