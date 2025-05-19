'use client';

import { AUTH_CONFIG } from './authConfig';

interface SessionValidationResult {
  isValid: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  error?: string;
}

interface CallbackResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Validates the current session with the backend
 */
export const validateSession = async (): Promise<SessionValidationResult> => {
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
  } catch (error: any) {
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Initiates the login process by redirecting to backend signin
 */
export const initiateLogin = (): void => {
  window.location.href = AUTH_CONFIG.endpoints.signin;
};

/**
 * Handles Microsoft callback with authorization code
 */
export const handleMsCallback = async (code: string): Promise<CallbackResult> => {
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Handles user logout
 */
export const logout = async (): Promise<CallbackResult> => {
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Checks if the current route requires authentication
 */
export const requiresAuth = (pathname: string): boolean => {
  const publicPaths = [
    '/login',
    AUTH_CONFIG.routes.unauthorized,
    '/',
    '/privacy',
    '/terms'
  ];
  return !publicPaths.includes(pathname);
};
