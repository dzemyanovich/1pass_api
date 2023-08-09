export default {
  clearMocks: true,
  modulePathIgnorePatterns: [
    'jest',
    'lambda/dist',
  ],
  moduleNameMapper: {
    '\\.(scss|svg|jpg|jpeg|png)$': '<rootDir>/jest/unit/emptyMock.js',
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
};
