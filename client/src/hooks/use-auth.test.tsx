import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from './use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the underlying Firebase service to prevent actual API calls
jest.mock('@/lib/firebase', () => ({
  AuthService: {
    onAuthStateChanged: jest.fn((callback) => {
      // Immediately call back with null user to simulate initial state
      callback(null);
      // Return an unsubscribe function
      return () => {};
    }),
    signInWithGoogle: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
  },
  // Mock other exports from firebase if they are used in the component
  // and cause issues in the test environment.
  db: {},
  analytics: {},
  storage: {},
  initializeFirebase: jest.fn(),
  verifyToken: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
);

describe('useAuth Hook', () => {
  it('should return user as null and isAuthenticated as false initially', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the initial onAuthStateChanged to fire
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
