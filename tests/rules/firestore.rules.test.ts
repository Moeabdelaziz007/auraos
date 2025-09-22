/**
 * @jest-environment node
 */
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Set up the test environment
  testEnv = await initializeTestEnvironment({
    projectId: 'auraos-test',
    firestore: {
      rules: fs.readFileSync(
        path.resolve(__dirname, '../../firebase/firestore.rules'),
        'utf8'
      ),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  // Tear down the test environment
  await testEnv.cleanup();
});

beforeEach(async () => {
  // Clear the database before each test
  await testEnv.clearFirestore();
});

describe('Firestore Security Rules', () => {

  it('should allow a user to read their own profile', async () => {
    const userId = 'test-user';
    const db = testEnv.authenticatedContext(userId).firestore();

    // Setup: Create a user document in the admin context
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', userId), {
        uid: userId,
        role: 'user',
      });
    });

    // The actual test
    const docRef = doc(db, 'users', userId);
    await assertSucceeds(getDoc(docRef));
  });

  it('should deny a user from reading another user\'s profile', async () => {
    const userId = 'test-user';
    const anotherUserId = 'another-user';
    const db = testEnv.authenticatedContext(userId).firestore();

    // The test: Attempt to read a document belonging to another user
    const docRef = doc(db, 'users', anotherUserId);
    await assertFails(getDoc(docRef));
  });

  it('should deny unauthenticated users from reading any profile', async () => {
    const db = testEnv.unauthenticatedContext().firestore();

    // The test: Attempt to read a document as an unauthenticated user
    const docRef = doc(db, 'users', 'any-user');
    await assertFails(getDoc(docRef));
  });
});
