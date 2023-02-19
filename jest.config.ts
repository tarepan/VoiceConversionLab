import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest/presets/js-with-ts",
  resolver: "ts-jest-resolver",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"],
  extensionsToTreatAsEsm: ['.ts'],
  // TypeScript ESmodule
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      { useESM: true, },
    ],
  },
};
export default jestConfig;
