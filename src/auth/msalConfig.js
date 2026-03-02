// src/auth/msalConfig.js
// Configure Azure AD app registration values via environment variables.
// REACT_APP_AZURE_CLIENT_ID and REACT_APP_AZURE_TENANT_ID must be set in .env
// for Microsoft SSO to work.

export const msalConfig = {
  auth: {
    clientId:    process.env.REACT_APP_AZURE_CLIENT_ID || '',
    authority:   `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || 'common'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation:       'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};
