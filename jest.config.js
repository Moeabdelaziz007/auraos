module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};
