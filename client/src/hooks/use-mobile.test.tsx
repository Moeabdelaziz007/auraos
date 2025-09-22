import { renderHook, act } from '@testing-library/react';
import useMobile from './use-mobile';

describe('useMobile', () => {
  const resizeWindow = (width: number) => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  };

  it('should return true if window width is less than or equal to maxWidth', () => {
    resizeWindow(500);
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);
  });

  it('should return false if window width is greater than maxWidth', () => {
    resizeWindow(1024);
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(false);
  });

  it('should update on window resize', () => {
    resizeWindow(500);
    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);

    act(() => {
      resizeWindow(1024);
    });
    expect(result.current).toBe(false);
  });

  it('should use a custom maxWidth', () => {
    resizeWindow(800);
    const { result } = renderHook(() => useMobile(900));
    expect(result.current).toBe(true);
  });
});
