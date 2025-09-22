import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script seeds the Firestore emulator with initial data for development and testing.
 *
 * How to run:
 * 1. Make sure the Firestore emulator is running.
 * 2. Set the GOOGLE_APPLICATION_CREDENTIALS environment variable to point to your service account key.
 *    (This is needed for the Admin SDK, even against the emulator).
 * 3. Run: ts-node scripts/seed-firestore.ts
 */

// Initialize Firebase Admin SDK
// Note: The Admin SDK connects to the emulator automatically if the
// FIRESTORE_EMULATOR_HOST environment variable is set.
try {
  initializeApp();
} catch (e) {
  console.log('Firebase already initialized.');
}

const db = getFirestore();

const seedData = {
  users: [
    {
      _schemaVersion: 1,
      uid: 'admin-user-id',
      email: 'admin@auraos.dev',
      displayName: 'AuraOS Admin',
      photoURL: null,
      role: 'admin',
      preferences: { theme: 'dark', language: 'en' },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
    },
    {
      _schemaVersion: 1,
      uid: 'test-user-id',
      email: 'test@auraos.dev',
      displayName: 'AuraOS Tester',
      photoURL: null,
      role: 'user',
      preferences: { theme: 'light', language: 'en' },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
    },
  ],
  workspaces: [
    {
      _schemaVersion: 1,
      name: 'Default Workspace',
      description: 'A default workspace for the test user.',
      ownerId: 'test-user-id',
      isPublic: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
  ],
};

async function seedDatabase() {
  console.log('Starting to seed database...');

  const batch = db.batch();

  // Seed users
  for (const user of seedData.users) {
    const ref = db.collection('users').doc(user.uid);
    batch.set(ref, user);
  }

  // Seed workspaces
  for (const workspace of seedData.workspaces) {
    const ref = db.collection('workspaces').doc();
    batch.set(ref, workspace);
  }

  try {
    await batch.commit();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
