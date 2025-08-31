module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globalTeardown: '<rootDir>/dist/globalTeardown.js',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^music-metadata$': '<rootDir>/node_modules/music-metadata/lib/index.js',
    '^file-type$': '<rootDir>/node_modules/file-type/index.js'
  },
};

