const functions = require('firebase-functions');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Auth0 configuration
const AUTH0_DOMAIN = functions.config().auth0?.domain || process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = functions.config().auth0?.audience || process.env.AUTH0_AUDIENCE;

// JWKS client for Auth0 token verification
const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
});

// Function to get signing key
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Verify Auth0 JWT token
const verifyAuth0Token = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * Cloud Function to create Firebase custom tokens from Auth0 tokens
 * This allows Auth0 users to authenticate with Firebase
 */
exports.createFirebaseToken = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract Auth0 token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const auth0Token = authHeader.split('Bearer ')[1];

    // Verify Auth0 token
    const decodedToken = await verifyAuth0Token(auth0Token);
    console.log('Auth0 token verified:', decodedToken.sub);

    // Extract user information from Auth0 token
    const userId = decodedToken.sub.replace('auth0|', ''); // Remove auth0| prefix if present
    const email = decodedToken.email;
    const name = decodedToken.name || decodedToken.nickname;

    // Create custom claims for Firebase
    const additionalClaims = {
      auth0Id: decodedToken.sub,
      email: email,
      name: name,
      // Map Auth0 custom claims to Firebase
      localAdmin: decodedToken[`https://${AUTH0_DOMAIN}/localAdmin`] || false,
      globalAdmin: decodedToken[`https://${AUTH0_DOMAIN}/globalAdmin`] || false,
      // Add farm memberships if available
      farmMemberships: decodedToken[`https://${AUTH0_DOMAIN}/farmMemberships`] || []
    };

    // Create Firebase custom token
    const firebaseToken = await admin.auth().createCustomToken(userId, additionalClaims);

    console.log(`Firebase token created for user: ${userId}`);

    res.status(200).json({
      firebaseToken: firebaseToken,
      userId: userId
    });

  } catch (error) {
    console.error('Error creating Firebase token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid Auth0 token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Auth0 token expired' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * Cloud Function to sync user data between Auth0 and Firebase
 * Called when users are created/updated in Auth0
 */
exports.syncAuth0User = functions.https.onRequest(async (req, res) => {
  // This would be called by Auth0 webhooks/actions
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  try {
    const { user, event } = req.body;
    
    if (!user || !user.user_id) {
      res.status(400).json({ error: 'Invalid user data' });
      return;
    }

    const userId = user.user_id.replace('auth0|', '');
    const userDocRef = admin.firestore().collection('users').doc(userId);

    const userData = {
      username: user.name || user.nickname,
      email: user.email,
      auth0Id: user.user_id,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: user.email_verified || false,
      // Preserve existing Firebase-specific data
      ...(event === 'user.created' ? {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        localAdmin: false,
        globalAdmin: false
      } : {})
    };

    await userDocRef.set(userData, { merge: true });    console.log(`User synced: ${userId} (event: ${event})`);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the functions
module.exports = {
  createFirebaseToken: exports.createFirebaseToken,
  syncAuth0User: exports.syncAuth0User
};
