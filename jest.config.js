const sharedMapper = { '^@/(.*)$': '<rootDir>/src/$1', '^.+\\.(css|svg|png|jpg|gif|webp)$': '<rootDir>/__mocks__/fileMock.cjs' }
const sharedTransform = { '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true }, diagnostics: false }] }
module.exports = {
  projects: [
    { displayName: 'components', testEnvironment: 'jsdom', testMatch: ['**/__tests__/**/*.test.tsx'], transform: sharedTransform, moduleNameMapper: sharedMapper, setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'] },
    { displayName: 'api-routes', testEnvironment: 'node', testMatch: ['**/__tests__/**/*api*.test.ts', '**/__tests__/**/*route*.test.ts', '**/__tests__/api/**/*.test.ts'], transform: sharedTransform, moduleNameMapper: sharedMapper },
  ],
}