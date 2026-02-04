// Mock dotenv to prevent .env file errors in tests
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Suppress console logs in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

