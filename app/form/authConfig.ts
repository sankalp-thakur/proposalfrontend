'use client';

export interface AuthConfig {
  endpoints: {
    signin: string;
    validate: string;
    logout: string;
    msCallback: string;
  };
  routes: {
    home: string;
    unauthorized: string;
  };
  errors: {
    initFailed: string;
    sessionExpired: string;
    unauthorized: string;
    networkError: string;
  };
}

export const AUTH_CONFIG: AuthConfig = {
  endpoints: {
    signin: `https://proposal.hygenco.in/api/auth/signin`,
    validate: `https://proposal.hygenco.in/api/auth/validate_session`,
    logout: `https://proposal.hygenco.in/api/auth/logout`,
    msCallback: `https://proposal.hygenco.in/api/auth/ms`
  },
  
  routes: {
    home: '/app',
    unauthorized: '/unauthorized'
  },
  
  errors: {
    initFailed: 'Failed to initialize authentication',
    sessionExpired: 'Your session has expired. Please login again.',
    unauthorized: 'You are not authorized to access this resource.',
    networkError: 'Network error. Please check your connection.',
  }
};
