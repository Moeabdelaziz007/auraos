import { Timestamp } from 'firebase/firestore';

// A standard interface for documents that include schema versioning.
export interface IVersionedDocument {
  _schemaVersion: number;
}

// Represents the main user document stored in the 'users' collection.
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

// Represents a workspace document in the 'workspaces' collection.
export interface IWorkspaceDocument extends IVersionedDocument {
  name: string;
  description: string;
  ownerId: string; // UID of the user who owns the workspace
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents a member within a workspace, stored in 'workspace-members'.
export interface IWorkspaceMemberDocument extends IVersionedDocument {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Timestamp;
}

// Represents an AI chat session in the 'ai-sessions' collection.
export interface IAISessionDocument extends IVersionedDocument {
  userId: string;
  modelId: string; // ID of the model used from the 'ai-models' collection
  title: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Represents a cached API response in the 'api-cache' collection.
export interface IApiCacheDocument extends IVersionedDocument {
  key: string; // A unique key representing the API request
  value: any; // The cached response data
  expiresAt: Timestamp;
}

// Represents a record of an applied database migration.
export interface IMigrationDocument {
  name:string; // e.g., 'V20250922__add_ai_usage_collection.ts'
  appliedAt: Timestamp;
}
