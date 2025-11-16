module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.(ts|js|html)$': 'jest-preset-angular'
  },
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@env/(.*)': '<rootDir>/src/environments/$1'
  },
  testEnvironment: 'jsdom',
  coverageReporters: ['html', 'text', 'lcov', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
