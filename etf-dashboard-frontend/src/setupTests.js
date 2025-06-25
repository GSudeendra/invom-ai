import '@testing-library/jest-dom'; 

// Suppress known React 18 and React Router warnings in tests
const suppressedWarnings = [
  /ReactDOMTestUtils\.act is deprecated/,
  /ReactDOM\.render is no longer supported in React 18/,
  /unmountComponentAtNode is deprecated/,
];
const originalError = console.error;
console.error = (...args) => {
  if (suppressedWarnings.some((pattern) => pattern.test(args[0]))) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalWarn(...args);
}; 