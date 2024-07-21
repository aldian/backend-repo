module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}', // Adjust the glob pattern to match source files
    '!**/*.d.ts',    // Exclude type declaration files
    '!**/index.ts',  // Exclude barrel files if any
  ],
};
