import 'jest-preset-angular/setup-jest';

// Mock window.CSS
Object.defineProperty(window, 'CSS', {value: null});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance']
  })
});

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
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: jest.fn(() => 'blob:mock-url')
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: jest.fn()
});
