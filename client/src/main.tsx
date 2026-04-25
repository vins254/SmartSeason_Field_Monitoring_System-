/**
 * Application Bootstrapper
 * 
 * Purpose:
 * This file is the bridge between our HTML and our React code. It initializes 
 * the React environment and mounts our application to the browser's DOM.
 * 
 * How it works:
 * 1. Finds the HTML element with id 'root'.
 * 2. Creates a React 'root' for that element.
 * 3. Renders the <App /> inside a <BrowserRouter> to enable URL-based navigation.
 * 4. Wraps everything in <StrictMode> to catch potential bugs early during development.
 */

import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)