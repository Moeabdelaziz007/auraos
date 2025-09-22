import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePostDialog from './create-post-dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Mock the toast function
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock the apiRequest function
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

// Mock the trackEvent function
jest.mock('../../lib/firebase', () => ({
  trackEvent: jest.fn(),
  // Mock other exports from firebase if they are used in the component
  // and cause issues in the test environment.
  initializeFirebase: jest.fn(),
  verifyToken: jest.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('CreatePostDialog', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (toast as jest.Mock).mockClear();
    (require('@/lib/queryClient').apiRequest as jest.Mock).mockClear();
    (require('../../lib/firebase').trackEvent as jest.Mock).mockClear();
    queryClient.clear();
  });

  it('renders the "Create Post" button', () => {
    render(<CreatePostDialog />, { wrapper: AllTheProviders });
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument();
  });

  it('opens the dialog when the "Create Post" button is clicked', async () => {
    render(<CreatePostDialog />, { wrapper: AllTheProviders });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));

    // The dialog may have animations, so wait for it to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
  });

  it('shows an error toast if content is empty on post attempt', async () => {
    render(<CreatePostDialog />, { wrapper: AllTheProviders });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const postButton = screen.getByRole('button', { name: /post/i });
    fireEvent.click(postButton);

    expect(toast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Oops!",
      description: "Post content cannot be empty.",
    });
  });

  it('calls the mutation when posting with content and shows success toast', async () => {
    const apiRequestMock = require('@/lib/queryClient').apiRequest;
    apiRequestMock.mockResolvedValue({ id: '123', content: 'Test post' });

    render(<CreatePostDialog />, { wrapper: AllTheProviders });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    fireEvent.change(textarea, { target: { value: 'This is a test post' } });

    const postButton = screen.getByRole('button', { name: /post/i });
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(apiRequestMock).toHaveBeenCalledWith('POST', '/api/posts', { content: 'This is a test post' });
    });

    await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
            title: "Post Created!",
            description: "Your post has been successfully shared.",
        });
    });
  });

  it('disables the post button while mutation is pending', async () => {
    const apiRequestMock = require('@/lib/queryClient').apiRequest;
    // Make the mock promise never resolve to keep it in a pending state
    apiRequestMock.mockImplementation(() => new Promise(() => {}));

    render(<CreatePostDialog />, { wrapper: AllTheProviders });
    fireEvent.click(screen.getByRole('button', { name: /create post/i }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());


    const textarea = screen.getByPlaceholderText(/what's on your mind/i);
    fireEvent.change(textarea, { target: { value: 'This is a test post' } });

    const postButton = screen.getByRole('button', { name: /post/i });
    fireEvent.click(postButton);

    await waitFor(() => {
        expect(postButton).toBeDisabled();
    });
  });
});
