// Auth0 configuration
export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'your-client-id',
  redirectUri: window.location.origin,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE, // Optional: for API access
  scope: 'openid profile email'
};

// Auth0 configuration for Firebase integration
export const auth0FirebaseConfig = {
  // Custom claims mapping for Firebase
  firebaseClaimsNamespace: 'https://farmsensors.app/',
  // Action to create Firebase custom tokens
  createFirebaseTokenUrl: process.env.REACT_APP_AUTH0_FIREBASE_TOKEN_URL
};
