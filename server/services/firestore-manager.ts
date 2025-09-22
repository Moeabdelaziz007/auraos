import { firestoreDb } from '../firebase';
import {
  CollectionReference,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  Query,
  QuerySnapshot,
  Transaction,
  WriteBatch,
} from 'firebase-admin/firestore';

// This interface is defined in our PROJECT_GUIDELINES.md and ensures
// that our manager conforms to the agreed-upon standard.
export interface IFirestoreManager {
  readonly db: Firestore;
  getCollection<T extends DocumentData>(collectionPath: string): CollectionReference<T>;
  getDocument<T extends DocumentData>(collectionPath: string, docId: string): Promise<DocumentSnapshot<T>>;
  createDocument<T extends DocumentData>(collectionPath: string, data: T, docId?: string): Promise<string>;
  updateDocument<T extends DocumentData>(collectionPath: string, docId: string, data: Partial<T>): Promise<void>;
  deleteDocument(collectionPath: string, docId: string): Promise<void>;
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
  createBatch(): WriteBatch;
}

/**
 * FirestoreManager is a singleton class that provides a robust, type-safe
 * interface for all Firestore operations on the server. It uses the centrally
 * initialized Firebase Admin SDK instance.
 */
export class FirestoreManager implements IFirestoreManager {
  private static instance: FirestoreManager;
  public readonly db: Firestore;

  private constructor() {
    // Use the centrally initialized Firestore instance from firebase.ts
    this.db = firestoreDb;
    console.log('FirestoreManager initialized.');
  }

  /**
   * Gets the singleton instance of the FirestoreManager.
   */
  public static getInstance(): FirestoreManager {
    if (!FirestoreManager.instance) {
      FirestoreManager.instance = new FirestoreManager();
    }
    return FirestoreManager.instance;
  }

  /**
   * Gets a typed reference to a Firestore collection.
   * @param collectionPath The path to the collection.
   * @returns A typed CollectionReference.
   */
  getCollection<T extends DocumentData>(collectionPath: string): CollectionReference<T> {
    return this.db.collection(collectionPath) as CollectionReference<T>;
  }

  /**
   * Retrieves a single document by its ID.
   * @param collectionPath The path to the collection.
   * @param docId The ID of the document.
   * @returns A DocumentSnapshot.
   */
  async getDocument<T extends DocumentData>(collectionPath: string, docId: string): Promise<DocumentSnapshot<T>> {
    try {
      const docRef = this.getCollection<T>(collectionPath).doc(docId);
      return await docRef.get();
    } catch (error) {
      console.error(`Error getting document '${docId}' from '${collectionPath}':`, error);
      throw new Error('Failed to retrieve document.');
    }
  }

  /**
   * Creates a new document in a collection.
   * @param collectionPath The path to the collection.
   * @param data The data for the new document.
   * @param docId Optional. If provided, sets the document with this ID.
   * @returns The ID of the newly created document.
   */
  async createDocument<T extends DocumentData>(collectionPath: string, data: T, docId?: string): Promise<string> {
    try {
      const timestamp = new Date();
      const dataWithTimestamps = { ...data, createdAt: timestamp, updatedAt: timestamp };

      if (docId) {
        await this.getCollection<T>(collectionPath).doc(docId).set(dataWithTimestamps);
        return docId;
      } else {
        const docRef = await this.getCollection<T>(collectionPath).add(dataWithTimestamps);
        return docRef.id;
      }
    } catch (error) {
      console.error(`Error creating document in '${collectionPath}':`, error);
      throw new Error('Failed to create document.');
    }
  }

  /**
   * Updates an existing document.
   * @param collectionPath The path to the collection.
   * @param docId The ID of the document to update.
   * @param data The partial data to update.
   */
  async updateDocument<T extends DocumentData>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = this.getCollection<T>(collectionPath).doc(docId);
      const dataWithTimestamp = { ...data, updatedAt: new Date() };
      await docRef.update(dataWithTimestamp);
    } catch (error) {
      console.error(`Error updating document '${docId}' in '${collectionPath}':`, error);
      throw new Error('Failed to update document.');
    }
  }

  /**
   * Deletes a document.
   * @param collectionPath The path to the collection.
   * @param docId The ID of the document to delete.
   */
  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    try {
      await this.getCollection(collectionPath).doc(docId).delete();
    } catch (error) {
      console.error(`Error deleting document '${docId}' from '${collectionPath}':`, error);
      throw new Error('Failed to delete document.');
    }
  }

  /**
   * Runs a Firestore transaction.
   * @param updateFunction The function to execute within the transaction.
   * @returns The result of the transaction function.
   */
  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    try {
      return await this.db.runTransaction(updateFunction);
    } catch (error) {
      console.error('Firestore transaction failed:', error);
      throw new Error('Transaction failed to complete.');
    }
  }

  /**
   * Creates a new WriteBatch.
   * @returns A new WriteBatch instance.
   */
  createBatch(): WriteBatch {
    return this.db.batch();
  }
}

// Export a singleton instance for easy use across the server.
export const firestoreManager = FirestoreManager.getInstance();
