import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  enableIndexedDbPersistence,
  Firestore,
  DocumentData,
  QuerySnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  IUserDocument,
  IAISessionDocument,
  IWorkspaceDocument
} from '../../shared/types/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const analytics: Analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => console.log('Firestore offline persistence enabled.'))
  .catch((err) => console.error('Error enabling offline persistence:', err));


// --- Authentication Service ---

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export class AuthService {
  static async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    await this.upsertUserInFirestore(result.user);
    return result.user;
  }

  static async signInAnonymously(): Promise<User> {
    const result = await signInAnonymously(auth);
    await this.upsertUserInFirestore(result.user);
    return result.user;
  }

  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  private static async upsertUserInFirestore(user: User): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userData: Partial<IUserDocument> = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp() as any, // Cast because serverTimestamp is a sentinel
    };

    // Use set with merge:true to create or update the document
    await setDoc(userRef, userData, { merge: true });
  }

  static async getUserData(uid: string): Promise<IUserDocument | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() as IUserDocument : null;
  }
}


// --- Firestore Service ---

export class FirestoreService {

  // Workspace Methods
  static async createWorkspace(userId: string, name: string, description: string): Promise<string> {
    const workspace: Omit<IWorkspaceDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      _schemaVersion: 1,
      name,
      description,
      ownerId: userId,
      isPublic: false,
    };
    const docRef = await addDoc(collection(db, 'workspaces'), {
      ...workspace,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getWorkspacesForUser(userId: string): Promise<IWorkspaceDocument[]> {
    const q = query(
      collection(db, 'workspaces'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IWorkspaceDocument));
  }

  // AI Session Methods
  static async createAISession(sessionData: Omit<IAISessionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'ai-sessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async getAISessions(userId: string, limitCount: number = 20): Promise<IAISessionDocument[]> {
    const q = query(
      collection(db, 'ai-sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IAISessionDocument));
  }

  static async updateAISession(sessionId: string, data: Partial<IAISessionDocument>): Promise<void> {
    const sessionRef = doc(db, 'ai-sessions', sessionId);
    await updateDoc(sessionRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

// --- Analytics Service ---

export const trackEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  logEvent(analytics, eventName, eventParams);
};

export { app, auth, db, analytics };
