import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Find the container element where the React app will mount.
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing in index.html');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);