module.exports = {
  preset: 'jest-expo',

  // Run after Jest environment is set up — adds custom matchers like toBeVisible()
  // Using the built-in matchers from @testing-library/react-native v12.4+
  // (replaces the deprecated @testing-library/jest-native package)
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],

  // Allow transforming ESM packages that Expo/RN ship as source
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|native-base' +
      '|react-native-svg' +
      '|socket\\.io-client' +
      '|engine\\.io-client' +
      '|@socket\\.io/.*' +
    '))',
  ],

  // Only look for tests inside src/ — never touch the website/ folder
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/website/'],

  // Map modules that don't need real implementations in tests
  moduleNameMapper: {
    // Silence static asset imports
    '\\.(jpg|jpeg|png|gif|svg|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Files to collect coverage from
  // Screens require complex native-component + navigation mocks — excluded from
  // coverage so thresholds reflect the truly unit-testable parts of the codebase.
  // socketService requires a live socket.io connection — also excluded.
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.{js,ts}',
    '!src/navigation/**',
    '!src/screens/**',
    '!src/theme/**',
    '!src/services/socketService.js',
  ],

  coverageReporters: ['text', 'lcov', 'html'],

  coverageThreshold: {
    global: {
      branches:   60,
      functions:  70,
      lines:      70,
      statements: 70,
    },
  },
};
