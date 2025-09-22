module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          baseUrl: '.',
          paths: {
            '@/*': ['client/src/*'],
          },
        },
      },
    ],
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.cjs'],
  collectCoverageFrom: [
    'client/src/lib/**/*.{ts,tsx}',
    'client/src/hooks/**/*.{ts,tsx}',
    '!client/src/**/*.test.{ts,tsx}',
    '!client/src/**/index.ts',
  ],
};
