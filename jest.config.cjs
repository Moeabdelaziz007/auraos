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
          // Allow `import.meta` syntax for Vite env vars
          module: 'esnext',
        },
      },
    ],
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^shared/(.*)$': '<rootDir>/shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.cjs'],
  collectCoverageFrom: [
    'client/src/lib/**/*.{ts,tsx}',
    'client/src/hooks/**/*.{ts,tsx}',
    '!client/src/**/*.test.{ts,tsx}',
    '!client/src/**/index.ts',
  ],
};
