// Page Tracker Component
// Automatically tracks page navigation and user interactions

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { usePageTracking } from '../../hooks/use-user-history';

interface PageTrackerProps {
  pageName: string;
  children: React.ReactNode;
}

/**
 * Higher-order component that automatically tracks page views
 */
export function PageTracker({ pageName, children }: PageTrackerProps) {
  usePageTracking(pageName);
  
  return <>{children}</>;
}

/**
 * Hook for tracking page navigation with wouter router
 */
export function useRouterTracking() {
  const [location] = useLocation();
  const previousLocation = useRef<string | null>(null);

  useEffect(() => {
    if (previousLocation.current && previousLocation.current !== location) {
      // Track navigation between pages
      console.log(`Navigation: ${previousLocation.current} -> ${location}`);
    }
    previousLocation.current = location;
  }, [location]);
}

/**
 * Component to wrap pages for automatic tracking
 */
export function withPageTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
) {
  return function TrackedPage(props: P) {
    return (
      <PageTracker pageName={pageName}>
        <WrappedComponent {...props} />
      </PageTracker>
    );
  };
}

export default PageTracker;
