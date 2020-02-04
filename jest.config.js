

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  runner: 'jest-runner',
  moduleFileExtensions: ['js'],
  errorOnDeprecated: true,
  roots: ['./build/tests'],
  testURL: 'http://localhost'
}