import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Add error logging
const logError = (error: Error) => {
  console.error('Application Error:', error);
};

window.onerror = (message, source, lineno, colno, error) => {
  logError(error || new Error(message as string));
  return false;
};

window.onunhandledrejection = (event) => {
  logError(event.reason);
};

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
