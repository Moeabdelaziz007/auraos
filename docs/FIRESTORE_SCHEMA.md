# 🔥 FIRESTORE_SCHEMA.md — AuraOS (v1.0)
> The single source of truth for the AuraOS Firestore database, including collections, data models, indexes, and security rules.

---

## Table of Contents
1. Collections Overview
2. TypeScript Interfaces (Data Models)
3. Indexing (`firestore.indexes.json`)
4. Security Rules (`firestore.rules`)
5. Migration Strategy
6. Data Versioning

---

## 1. Collections Overview

The following is a list of the primary collections in the Firestore database.

-   `users`: Stores core user authentication data, roles, and high-level preferences. Document ID is the Firebase `uid`.
-   `user-profiles`: Stores public-facing user profile information.
-   `workspaces`: Top-level organizational units for users' work.
-   `workspace-members`: Maps users to workspaces with specific roles/permissions. Document ID is a composite key: `${workspaceId}_${userId}`.
-   `ai-sessions`: Records a history of AI chat sessions and interactions.
-   `ai-models`: A list of available AI models and their configurations.
-   `api-cache`: Caches results from expensive third-party API calls to reduce latency and cost.
-   `system-logs`: Logs critical system events and errors for auditing and debugging.
-   `system-metrics`: Stores performance and usage metrics.
-   `migrations`: Records which database migration scripts have been successfully applied.

---

## 2. TypeScript Interfaces (Data Models)

All application code MUST use these TypeScript interfaces when interacting with Firestore to ensure type safety.

```ts
// Located in: src/shared/types/firestore.ts
import { Timestamp } from 'firebase-admin/firestore';

// Used for schema versioning
export interface IVersionedDocument {
  _schemaVersion: number;
}

export interface IUserDocument extends IVersionedDocument {
  uid: string; // Firebase Auth UID
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  preferences: {
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface IWorkspaceDocument extends IVersionedDocument {
  name: string;
  description: string;
  ownerId: string; // UID of the user who owns the workspace
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IWorkspaceMemberDocument extends IVersionedDocument {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Timestamp;
}

export interface IAISessionDocument extends IVersionedDocument {
  userId: string;
  modelId: string; // ID of the model used from `ai-models` collection
  title: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface IApiCacheDocument extends IVersionedDocument {
  key: string; // Hashed key of the API request
  value: any;
  expiresAt: Timestamp;
}

export interface IMigrationDocument {
  name: string; // e.g., V20250922__add-aiUsage-collection.ts
  appliedAt: Timestamp;
}
```

---

## 3. Indexing (`firestore.indexes.json`)

This file defines the composite indexes required for complex queries. It MUST be deployed with the Firebase CLI.

**Location:** `firebase/firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "workspaces",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ownerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ai-sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 4. Security Rules (`firestore.rules`)

These rules implement a Role-Based Access Control (RBAC) system. They are the single source of truth for data access authorization.

**Location:** `firebase/firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    function isAuthenticated() {
      return request.auth != null;
    }

    function isUser(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    function getUserData(uid) {
      return get(/databases/$(database)/documents/users/$(uid)).data;
    }

    function isRole(uid, role) {
      return getUserData(uid).role == role;
    }

    function getWorkspaceMemberRole(workspaceId, uid) {
      return get(/databases/$(database)/documents/workspace-members/$(workspaceId + '_' + uid)).data.role;
    }

    function isWorkspaceMember(workspaceId, uid) {
        return exists(/databases/$(database)/documents/workspace-members/$(workspaceId + '_' + uid));
    }


    // --- Collection Rules ---

    // Users can read their own data. Admins can read anyone's data.
    // Users can only create/update their own data.
    match /users/{userId} {
      allow read: if isUser(userId) || isRole(request.auth.uid, 'admin');
      allow create, update: if isUser(userId);
      // Deletion of users should be handled by a privileged server process.
      allow delete: if false;
    }

    // Workspaces can be created by any authenticated user.
    // Read access is granted if the workspace is public or the user is a member.
    // Update/delete access is granted only to owners or admins of the workspace.
    match /workspaces/{workspaceId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated() && (resource.data.isPublic == true || isWorkspaceMember(workspaceId, request.auth.uid));
      allow update, delete: if isAuthenticated() && getWorkspaceMemberRole(workspaceId, request.auth.uid) in ['owner', 'admin'];
    }

    // Workspace members can be read by any other member of the same workspace.
    // Only workspace owners/admins can add/remove/update members.
    // Note: Document ID is a composite key: `${workspaceId}_${userId}`
    match /workspace-members/{memberDocId} {
      allow read: if isAuthenticated() && isWorkspaceMember(resource.data.workspaceId, request.auth.uid);
      allow create, write: if isAuthenticated() && getWorkspaceMemberRole(resource.data.workspaceId, request.auth.uid) in ['owner', 'admin'];
      allow delete: if isAuthenticated() && (
        isUser(resource.data.userId) || // User can leave a workspace
        getWorkspaceMemberRole(resource.data.workspaceId, request.auth.uid) in ['owner', 'admin'] // Admin can remove a user
      );
    }

    // AI sessions are private to the user who created them.
    match /ai-sessions/{sessionId} {
      allow read, write, create: if isAuthenticated() && request.auth.uid == request.resource.data.userId;
    }

    // System collections are locked down and should only be accessed by the server (Admin SDK).
    match /system-logs/{logId} {
      allow read, write: if false;
    }
    match /system-metrics/{metricId} {
      allow read, write: if false;
    }
    match /api-cache/{cacheId} {
      allow read, write: if false;
    }
    match /migrations/{migrationId} {
      allow read, write: if false;
    }
  }
}
```
*(Note: The workspace membership rules use composite document IDs (`${workspaceId}_${userId}`) to enable efficient and cost-effective security checks.)*

---

## 5. Migration Strategy

*   **Folder:** `/scripts/migrations`
*   **Naming Convention:** `V{YYYYMMDDHHMMSS}__description.ts` (e.g., `V20250922183000__add-ai-usage-collection.ts`)
*   **Structure:** Each migration script must export an `up()` function and optionally a `down()` function for rollbacks.
*   **Execution:** A master script (`scripts/run-migrations.ts`) will execute pending migration scripts in order.
*   **Tracking:** On successful execution of an `up()` function, a document is added to the `migrations` collection to prevent the same migration from running twice.

---

## 6. Data Versioning

*   **Schema Version Field:** To facilitate data transformations during migrations, every top-level document in a collection will include a `_schemaVersion` field (e.g., `_schemaVersion: 1`).
*   **Bumping Versions:** Migration scripts are responsible for incrementing the `_schemaVersion` field after transforming a document to the new schema. This allows migrations to safely target only the documents that need updating.
