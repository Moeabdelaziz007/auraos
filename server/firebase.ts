import admin from 'firebase-admin';

let isFirebaseInitialized = false;

export function initializeFirebase() {
  if (admin.apps.length === 0) {
    try {
      console.log('Initializing Firebase...');
      // Attempt to initialize with application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`
      });
      console.log('Firebase initialized successfully.');
      isFirebaseInitialized = true;
    } catch (e) {
      console.error('Firebase initialization failed:', e);
      console.log('Could not initialize Firebase Admin SDK. Some features may be disabled.');
    }
  }

  return {
    admin,
    isFirebaseInitialized
  };
}

export async function verifyToken(token: string) {
    if (!isFirebaseInitialized) {
        initializeFirebase();
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw new Error('Invalid authentication token');
    }
}
