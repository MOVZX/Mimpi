/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.d.ts",
    "!src/main.tsx",
    "!src/index.css",
  ],
};
