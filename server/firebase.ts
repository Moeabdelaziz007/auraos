import admin from 'firebase-admin';

const initializeFirebase = () => {
  // Check if the app is already initialized to prevent errors
  if (admin.apps.length === 0) {
    try {
      console.log('Initializing Firebase Admin SDK...');
      // Initialize with Application Default Credentials, which are automatically
      // available in environments like Cloud Functions and Cloud Run.
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (e) {
      console.error('Firebase Admin SDK initialization failed:', e);
      // The app can continue running, but Firebase-dependent features will fail.
    }
  }
};

// Initialize the SDK when this module is first loaded.
initializeFirebase();

// Export the initialized services for use in other parts of the server.
export const firebaseAdmin = admin;
export const firestoreDb = admin.firestore();
export const firebaseAuth = admin.auth();

/**
 * Verifies a Firebase ID token using the initialized Auth service.
 * @param {string} token The ID token to verify.
 * @returns {Promise<admin.auth.DecodedIdToken>} A promise that resolves with the decoded ID token.
 */
export const verifyToken = async (token: string) => {
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Re-throw a more generic error to avoid leaking implementation details.
    throw new Error('Invalid or expired authentication token.');
  }
};
