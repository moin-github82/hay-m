// Extend Vitest's expect with jest-dom matchers
// e.g. toBeInTheDocument(), toHaveTextContent(), toBeDisabled() …
import '@testing-library/jest-dom';

// Silence console.error noise from React during tests (e.g. prop-type warnings)
// Remove this if you want to see all warnings.
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    // Suppress known noisy React warnings in test output
    if (
      msg.includes('Warning:') ||
      msg.includes('ReactDOM.render') ||
      msg.includes('act(')
    ) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });
