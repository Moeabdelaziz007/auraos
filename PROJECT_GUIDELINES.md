# 📖 PROJECT_GUIDELINES.md — AuraOS (Version 1.2)
> The official constitution for the AuraOS project. It aims for Zero-Cost, scalability, and a cohesive user experience.

## Summary
- Primary DB: Firestore (Google)
- Architecture: React (Vite) frontend, Node/Express backend (Firebase Functions optional)
- Agents: Cursor (builder), Jules (reviewer)
- All agents must read this file before changing code.

---

## Table of Contents
1. Code Style Rules
2. Project Structure
3. AI Services Integration
4. MCP Servers
5. Free API Integrations
6. Database Management (High-Level)
7. Firestore Integration (Detailed)
8. Testing Rules
9. Configuration Management
10. Error Handling & Logging
11. Security Guidelines
12. Offline-First Strategy (Client)
13. CI/CD (GitHub Actions + Firebase)
14. IDE / Agent Rules
15. Commit & Branching Rules
16. Code Review Process
17. Deployment Procedures
18. Migrations & Backups
19. Success Metrics

---

## 1. Code Style Rules
- Language: **TypeScript (strict mode ON)**. Secondary: Python (for MCP servers).
- Formatting: `prettier` + `eslint` enforced pre-commit.
- Naming Conventions:
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Variables/Functions: `camelCase`
  - Interfaces: `IPascalCase` or `PascalCase`
- Imports: Use absolute paths via `@/` aliases configured in `tsconfig.json`.
- Documentation: JSDoc comments for all public methods and interfaces.

## 2. Project Structure (Root)
```
/docs/                # Documentation files (e.g., FIRESTORE_SCHEMA.md)
/public/              # Static assets
/src/
  /client/            # Frontend application (React, Vite)
    /components/
    /hooks/           # Custom React hooks (e.g., use-firestore.ts)
    /lib/             # Core libraries (firebase.ts, utils.ts)
    /pages/
    /services/        # Client-side services
  /server/            # Backend application (Node.js, Express/Firebase Functions)
    /api/             # API route definitions
    /services/        # Backend services (e.g., firestore-manager.ts)
    /utils/
  /shared/            # Code shared between client and server (e.g., types)
/firebase/            # Firebase-specific configurations
  firestore.rules     # Firestore security rules
  firestore.indexes.json # Firestore composite indexes
/scripts/             # Automation and utility scripts (e.g., seeding, migrations)
/tests/               # Test files
  /e2e/
  /integration/
  /unit/
```
*(Note: This is a target structure; the existing structure will be refactored towards this standard.)*

## 6. Database Management — High-Level
- **Primary Datastore:** Firestore (NoSQL) is the single source of truth for primary application data.
- **Alternative Datastores:** Supabase or MongoDB should only be considered for specific use cases where Firestore is not a good fit, and must be approved architecturally.
- **Server-Side Operations:** All database operations on the server MUST go through the `FirestoreManager` to ensure consistency and encapsulation.
- **Data Integrity:** Use Firestore Transactions for critical, multi-step operations. Use Batched Writes for bulk operations to improve performance.

---

## 7. Firestore Integration (DETAILED)

### 7.1 Firestore Manager Interface (TypeScript)
A `FirestoreManager` will be implemented on the server to handle all database interactions. It will conform to the following interface:
```ts
// src/server/services/firestore-manager.ts (interface definition)
import type { Firestore, CollectionReference, DocumentData, DocumentSnapshot, QuerySnapshot, Transaction } from 'firebase-admin/firestore';

export interface IFirestoreManager {
  readonly db: Firestore;

  getCollection(name: string): CollectionReference;

  createDocument<T extends DocumentData>(collection: string, data: T): Promise<string>;

  updateDocument<T extends DocumentData>(collection:string, docId: string, data: Partial<T>): Promise<void>;

  deleteDocument(collection: string, docId: string): Promise<void>;

  getDocument(collection: string, docId: string): Promise<DocumentSnapshot>;

  queryCollection(collection: string, constraints: any[]): Promise<QuerySnapshot>;

  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
}
```

### 7.2 Integration Rules
* **Server-side:** Always use the `firebase-admin` (Admin SDK) for backend operations. This will be encapsulated within `src/server/services/firestore-manager.ts`.
* **Client-side:** Use the modular Firebase Web SDK (`firebase/app`, `firebase/firestore`, etc.) to minimize bundle size. Client-side logic should be placed in `src/client/lib/firebase.ts` and related services.
* **Local Development:** The Firebase Emulator Suite (`firebase emulators:start`) MUST be used for all local development and testing to avoid interacting with production data.
* **Secrets Management:** The Firebase service account key (JSON) MUST be stored in GitHub Secrets (`FIREBASE_SERVICE_ACCOUNT`) for CI/CD and NOT be committed to the repository.
* **Indexing:** All composite indexes MUST be defined in `firebase/firestore.indexes.json` and deployed via the CI/CD pipeline.
* **Security Rules:** All security rules MUST be defined in `firebase/firestore.rules` and deployed via the CI/CD pipeline.

### 7.3 Collections & Naming Conventions
* **Collection Names:** Use `plural-kebab-case` for all collection names (e.g., `user-profiles`, `ai-sessions`).
* **Standard Fields:** Every document should, where applicable, include standard timestamp and ownership fields:
  - `createdAt`: `Timestamp`
  - `updatedAt`: `Timestamp`
  - `createdBy`: `string` (User ID)
  - `updatedBy`: `string` (User ID)
* **Data Structure:** Avoid deeply nested objects within documents. Prefer using subcollections for related, bounded data sets to optimize query performance.

### 7.4 Security (Role-Based Access Control)
* **RBAC Model:** A Role-Based Access Control (RBAC) model will be implemented. A `role` field (e.g., 'admin', 'user') will be stored on the `users` document. More granular permissions can be managed via a `workspaceMembers` collection that links users to workspaces with specific roles.
* **Implementation:** The RBAC logic will be enforced exclusively through `firebase/firestore.rules`. See `FIRESTORE_SCHEMA.md` for the detailed rule implementation.

### 7.5 Offline & Caching
* **Client-Side Persistence:** The client application MUST enable Firestore's IndexedDB persistence via `enableIndexedDbPersistence()` to provide a robust offline-first experience. Use `onSnapshot` listeners to get real-time updates.
* **Caching Layer:** A dedicated `api-cache` collection in Firestore can be used for server-side caching of expensive operations or third-party API calls. A Time-to-Live (TTL) strategy must be implemented to invalidate stale cache entries.

### 7.6 CI/CD
* **GitHub Actions:** The CI/CD pipeline will be managed via GitHub Actions. The workflow will:
  1. Run all tests (unit, integration, and security rules).
  2. On success and merge to `main`, automatically deploy Firestore rules, indexes, and any updated Firebase Hosting or Functions.
* **Deployment Action:** Use the official `FirebaseExtended/action-hosting-deploy` action or a similar trusted action for deployments, configured with the `FIREBASE_SERVICE_ACCOUNT` secret.

---

## 8. Testing Rules
* **Security Rules:** Use the `@firebase/rules-unit-testing` library to write tests for all Firestore security rules. This is a mandatory step.
* **Unit Tests:** Use `vitest` or `jest` for unit testing individual functions and components.
* **Integration Tests:** Integration tests should run against the Firebase Emulator Suite. A seeding script will populate the emulator with test data before the tests are run.
* **Coverage:** Aim for a minimum of 80% test coverage for all new code.

---

## 10. Error Handling & Logging
* **Client-Side:** Implement a global error boundary in React. Report errors to a dedicated logging service.
* **Server-Side:** Use a centralized error handling middleware in the Express/Cloud Functions app.
* **Logging Strategy:**
  - **Firebase Crashlytics:** (Optional, for mobile) Can be integrated for advanced crash reporting.
  - **Cloud Logging:** All server-side logs (from Firebase Functions or other GCP services) are automatically collected in Google Cloud Logging. Use structured logging (e.g., JSON payloads) to make logs searchable and actionable.
  - **Custom Log Collection:** For critical user-facing errors or system events, consider logging to a dedicated `system-logs` collection in Firestore to provide an in-app audit trail. This requires careful consideration of security rules.

---

## 14. IDE / Agent Rules
* **Protected Files:** The following files are considered critical infrastructure and MUST NOT be modified without architectural review and approval:
  - `PROJECT_GUIDELINES.md`
  - `docs/FIRESTORE_SCHEMA.md`
  - `firebase/firestore.rules`
  - `firebase/firestore.indexes.json`
  - `src/server/services/firestore-manager.ts`
* **Agent Workflow:** All agents (including Jules) must follow this workflow:
  1. Read and understand these guidelines.
  2. Create a new feature branch from `main`.
  3. Implement the feature or fix.
  4. Run all local tests and linting.
  5. Open a Pull Request for review.
  6. Await approval from another agent (or human) before merging.

---

## 18. Migrations & Backups
* **Migrations:** All database schema changes must be accompanied by a migration script. See `docs/MIGRATIONS_GUIDE.md` for the detailed process.
* **Backups:**
  - **Manual:** Regular manual exports can be performed from the Firebase Console.
  - **Automated:** Automated daily exports to a Google Cloud Storage bucket can be configured. **Warning:** This requires enabling billing on the Firebase project. This will not be enabled under the Zero-Cost goal.

---

## 19. Success Metrics (Summary)
* **Performance:** p95 query time < 100ms.
* **Offline Sync:** Initial sync < 5 seconds.
* **Cache:** Cache hit rate >= 80%.
* **Security:** 0 unauthorized access incidents.
