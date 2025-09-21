// Core Auth skeleton (Firebase Auth placeholder)
// Sprint 1: wire to Firebase Auth using env-configured keys.

// NOTE: We intentionally avoid importing a Firebase app here to keep this file standalone
// until Core's app bootstrapping is finalized. These functions are placeholders.

export type AuthUser = {
  uid: string
  email?: string | null
  displayName?: string | null
  photoURL?: string | null
};

export async function signInWithEmail(_email: string, _password: string): Promise<AuthUser | null> {
  console.warn('[Core/Auth] signInWithEmail called (placeholder). Implement Firebase Auth wiring.');
  return null;
}

export async function signOut(): Promise<void> {
  console.warn('[Core/Auth] signOut called (placeholder). Implement Firebase Auth wiring.');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  console.warn('[Core/Auth] getCurrentUser called (placeholder). Implement Firebase Auth wiring.');
  return null;
}
