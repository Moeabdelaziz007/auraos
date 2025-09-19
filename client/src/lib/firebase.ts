import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApDku-geNVplwIgRBz2U0rs46aAVo-_mE",
  authDomain: "aios-97581.firebaseapp.com",
  projectId: "aios-97581",
  storageBucket: "aios-97581.appspot.com",
  messagingSenderId: "307575156824",
  appId: "1:307575156824:web:00924bd384df1f29909a2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export class AuthService {
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user data to Firestore
      await this.saveUserToFirestore(user);
      
      return user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static async saveUserToFirestore(user: User): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };

      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      throw error;
    }
  }

  static async getUserData(uid: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  static async updateUserData(uid: string, data: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
}

export class FirestoreService {
  // Posts
  static async createPost(userId: string, postData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  static async getPosts(userId?: string, limitCount: number = 10): Promise<any[]> {
    try {
      let q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (userId) {
        q = query(
          collection(db, 'posts'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  }

  static async updatePost(postId: string, data: any): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  static async deletePost(postId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Workflows
  static async createWorkflow(userId: string, workflowData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'workflows'), {
        ...workflowData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  static async getWorkflows(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'workflows'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting workflows:', error);
      throw error;
    }
  }

  // AI Agents
  static async createAgent(userId: string, agentData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'agents'), {
        ...agentData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  static async getAgents(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'agents'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  }

  // Chat Messages
  static async createChatMessage(userId: string, messageData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'chatMessages'), {
        ...messageData,
        userId,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  static async getChatMessages(userId: string, limitCount: number = 50): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting chat messages:', error);
      throw error;
    }
  }
}

export default app;
