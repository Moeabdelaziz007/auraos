// Firestore Configuration and Rules for AuraOS

import { db } from './firebase';
import { COLLECTIONS } from './firestore-types';

/**
 * Firestore Security Rules Template
 * 
 * Copy these rules to your Firebase Console > Firestore Database > Rules
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users can read/write their own user document
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Posts - users can create, read, update, delete their own posts
 *     match /posts/{postId} {
 *       allow read: if resource.data.visibility == 'public' || 
 *                     (request.auth != null && request.auth.uid == resource.data.userId) ||
 *                     (request.auth != null && request.auth.uid in resource.data.sharedWith);
 *       allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
 *       allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
 *     }
 *     
 *     // Workflows - users can manage their own workflows
 *     match /workflows/{workflowId} {
 *       allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
 *     }
 *     
 *     // Agents - users can manage their own agents
 *     match /agents/{agentId} {
 *       allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
 *     }
 *     
 *     // Chat Messages - users can manage their own messages
 *     match /chatMessages/{messageId} {
 *       allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
 *     }
 *     
 *     // Analytics - read-only for users, write for system
 *     match /analytics/{userId} {
 *       allow read: if request.auth != null && request.auth.uid == userId;
 *       allow write: if false; // Only system can write analytics
 *     }
 *     
 *     // Notifications - users can read their own notifications
 *     match /notifications/{notificationId} {
 *       allow read, update: if request.auth != null && request.auth.uid == resource.data.userId;
 *       allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
 *     }
 *   }
 * }
 */

/**
 * Firestore Indexes Configuration
 * 
 * Add these indexes in Firebase Console > Firestore Database > Indexes
 * 
 * Collection: posts
 * Fields: userId (Ascending), createdAt (Descending)
 * 
 * Collection: posts  
 * Fields: visibility (Ascending), createdAt (Descending)
 * 
 * Collection: workflows
 * Fields: userId (Ascending), status (Ascending), createdAt (Descending)
 * 
 * Collection: agents
 * Fields: userId (Ascending), status (Ascending), createdAt (Descending)
 * 
 * Collection: chatMessages
 * Fields: userId (Ascending), createdAt (Descending)
 * 
 * Collection: chatMessages
 * Fields: userId (Ascending), agentId (Ascending), createdAt (Descending)
 */

export class FirestoreConfig {
  /**
   * Initialize Firestore with proper configuration
   */
  static initialize() {
    // Enable offline persistence
    if (typeof window !== 'undefined') {
      // Client-side only
      import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
        // Enable network by default
        enableNetwork(db);
      });
    }
  }

  /**
   * Get collection reference with proper typing
   */
  static getCollection(collectionName: keyof typeof COLLECTIONS) {
    return COLLECTIONS[collectionName];
  }

  /**
   * Validate data before writing to Firestore
   */
  static validateData(data: any, schema: string): boolean {
    try {
      switch (schema) {
        case 'user':
          return this.validateUser(data);
        case 'post':
          return this.validatePost(data);
        case 'workflow':
          return this.validateWorkflow(data);
        case 'agent':
          return this.validateAgent(data);
        case 'chatMessage':
          return this.validateChatMessage(data);
        default:
          return true;
      }
    } catch (error) {
      console.error('Data validation error:', error);
      return false;
    }
  }

  private static validateUser(data: any): boolean {
    return !!(
      data.uid &&
      data.email &&
      data.displayName &&
      data.createdAt &&
      data.preferences
    );
  }

  private static validatePost(data: any): boolean {
    return !!(
      data.userId &&
      data.content &&
      data.createdAt &&
      typeof data.likes === 'number' &&
      typeof data.comments === 'number' &&
      typeof data.shares === 'number'
    );
  }

  private static validateWorkflow(data: any): boolean {
    return !!(
      data.userId &&
      data.name &&
      data.steps &&
      Array.isArray(data.steps) &&
      data.status &&
      data.createdAt
    );
  }

  private static validateAgent(data: any): boolean {
    return !!(
      data.userId &&
      data.name &&
      data.persona &&
      data.capabilities &&
      Array.isArray(data.capabilities) &&
      data.status &&
      data.createdAt
    );
  }

  private static validateChatMessage(data: any): boolean {
    return !!(
      data.userId &&
      data.content &&
      data.type &&
      data.sender &&
      data.createdAt
    );
  }

  /**
   * Get Firestore connection status
   */
  static async getConnectionStatus(): Promise<boolean> {
    try {
      // Try to read a simple document to test connection
      const testRef = doc(db, 'test', 'connection');
      await getDoc(testRef);
      return true;
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      return false;
    }
  }

  /**
   * Clean up old data based on retention policies
   */
  static async cleanupOldData(userId: string): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days retention

      // Clean up old chat messages
      const oldMessagesQuery = query(
        collection(db, COLLECTIONS.CHAT_MESSAGES),
        where('userId', '==', userId),
        where('createdAt', '<', cutoffDate)
      );

      const oldMessagesSnap = await getDocs(oldMessagesQuery);
      const batch = writeBatch(db);

      oldMessagesSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      if (oldMessagesSnap.docs.length > 0) {
        await batch.commit();
        console.log(`Cleaned up ${oldMessagesSnap.docs.length} old messages`);
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  /**
   * Backup user data to a separate collection
   */
  static async backupUserData(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const backupRef = doc(db, 'backups', `${userId}_${Date.now()}`);
        await setDoc(backupRef, {
          ...userSnap.data(),
          backedUpAt: new Date(),
          originalUserId: userId
        });
        console.log('User data backed up successfully');
      }
    } catch (error) {
      console.error('Error backing up user data:', error);
    }
  }
}

// Initialize Firestore configuration
FirestoreConfig.initialize();
