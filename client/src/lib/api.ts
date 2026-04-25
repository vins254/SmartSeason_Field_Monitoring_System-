/**
 * API Communication Layer
 * 
 * Purpose:
 * Centralizes all network requests to the backend. This ensures that every 
 * request is consistent and properly authenticated.
 * 
 * How it works:
 * 1. Defines 'apiFetch', a customized version of the browser's 'fetch'.
 * 2. Automatically pulls the 'smartseason_token' from local storage.
 * 3. Injects the Bearer Token into the Authorization header for every call.
 * 4. Handles base URL configuration for different environments.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';


export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('smartseason_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};