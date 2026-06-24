/**
 * Jest test setup
 * Runs before each test file
 */

// Mock window global for browser environment testing
global.window = global.window || ({} as Window & typeof globalThis);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});
