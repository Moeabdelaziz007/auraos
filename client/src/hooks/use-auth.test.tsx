import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './use-auth';

describe('useAuth', () => {
  it('should return user as null initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });
});
