'use client';

import { AUTH_CONFIG } from './authConfig';

/**
 * Validates the current session with the backend
 * @returns {Promise<{isValid: boolean, user?: {id: number, name: string, email: string}}>}
 */
export const validateSession = async () => {
  try {
    const response = await fetch(AUTH_CONFIG.endpoints.validate, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 401) {
        return { isValid: false, error: AUTH_CONFIG.errors.unauthorized };
      }
      throw new Error(AUTH_CONFIG.errors.networkError);
    }

    const data = await response.json();
    return {
      isValid: true,
      user: data.user
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Initiates the login process by redirecting to backend signin
 */
export const initiateLogin = () => {
  window.location.href = AUTH_CONFIG.endpoints.signin;
};

/**
 * Handles Microsoft callback with authorization code
 * @param {string} code - The authorization code from Microsoft
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const handleMsCallback = async (code) => {
  try {
    const response = await fetch(AUTH_CONFIG.endpoints.msCallback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to process Microsoft callback');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Handles user logout
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logout = async () => {
  try {
    const response = await fetch(AUTH_CONFIG.endpoints.logout, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Checks if the current route requires authentication
 */
export const requiresAuth = (pathname) => {
  const publicPaths = [
    AUTH_CONFIG.routes.login,
    '/unauthorized',
    '/',
    '/privacy',
    '/terms'
  ];
  return !publicPaths.includes(pathname);
};        