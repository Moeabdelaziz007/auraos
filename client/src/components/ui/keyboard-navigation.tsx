import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape') => void;
  enabled?: boolean;
}

export function KeyboardNavigation({ 
  children, 
  className, 
  onNavigate,
  enabled = true 
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, altKey, metaKey } = event;
      
      // Ignore if modifier keys are pressed (except for specific shortcuts)
      if (ctrlKey || altKey || metaKey) {
        return;
      }

      let direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'escape' | null = null;

      switch (key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'Enter':
        case ' ':
          direction = 'enter';
          break;
        case 'Escape':
          direction = 'escape';
          break;
        default:
          return;
      }

      if (direction && onNavigate) {
        event.preventDefault();
        onNavigate(direction);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onNavigate]);

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  );
}

interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  order: number;
}

interface FocusManagerProps {
  children: React.ReactNode;
  className?: string;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export function FocusManager({ 
  children, 
  className, 
  trapFocus = false,
  restoreFocus = true 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    return elements
      .map((element, index) => ({
        element,
        tabIndex: element.tabIndex || 0,
        order: element.tabIndex || index + 1
      }))
      .sort((a, b) => a.order - b.order);
  }, []);

  useEffect(() => {
    if (trapFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    const elements = getFocusableElements();
    setFocusableElements(elements);

    if (trapFocus && elements.length > 0) {
      elements[0].element.focus();
    }

    return () => {
      if (restoreFocus && trapFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [trapFocus, restoreFocus, getFocusableElements]);

  useEffect(() => {
    if (!trapFocus) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const firstElement = focusableElements[0]?.element;
        const lastElement = focusableElements[focusableElements.length - 1]?.element;

        if (event.shiftKey) {
          // Shift + Tab: move backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: move forwards
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trapFocus, focusableElements]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

interface KeyboardShortcutsProps {
  shortcuts: Record<string, () => void>;
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

export function KeyboardShortcuts({ 
  shortcuts, 
  children, 
  className,
  enabled = true 
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, altKey, metaKey, shiftKey } = event;
      
      // Build shortcut string
      const modifiers = [];
      if (ctrlKey || metaKey) modifiers.push('ctrl');
      if (altKey) modifiers.push('alt');
      if (shiftKey) modifiers.push('shift');
      
      const shortcutKey = [...modifiers, key.toLowerCase()].join('+');
      
      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);

  return <div className={className}>{children}</div>;
}

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "z-50 px-4 py-2 bg-primary text-primary-foreground rounded-md",
        "neon-glow-sm transition-all duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}

interface KeyboardHintProps {
  hint: string;
  className?: string;
}

export function KeyboardHint({ hint, className }: KeyboardHintProps) {
  return (
    <div className={cn(
      "text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded",
      "border border-border/50",
      className
    )}>
      {hint}
    </div>
  );
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const elementsRef = useRef<HTMLElement[]>([]);

  const registerElement = useCallback((element: HTMLElement | null, index: number) => {
    if (element) {
      elementsRef.current[index] = element;
    }
  }, []);

  const focusElement = useCallback((index: number) => {
    if (elementsRef.current[index]) {
      elementsRef.current[index].focus();
      setFocusedIndex(index);
    }
  }, []);

  const focusNext = useCallback(() => {
    const nextIndex = Math.min(focusedIndex + 1, elementsRef.current.length - 1);
    focusElement(nextIndex);
  }, [focusedIndex, focusElement]);

  const focusPrevious = useCallback(() => {
    const prevIndex = Math.max(focusedIndex - 1, 0);
    focusElement(prevIndex);
  }, [focusedIndex, focusElement]);

  const focusFirst = useCallback(() => {
    focusElement(0);
  }, [focusElement]);

  const focusLast = useCallback(() => {
    focusElement(elementsRef.current.length - 1);
  }, [focusElement]);

  return {
    focusedIndex,
    registerElement,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  };
}

// Common keyboard shortcuts
export const COMMON_SHORTCUTS = {
  'ctrl+k': () => {
    // Open search or command palette
    console.log('Opening search/command palette');
  },
  'ctrl+/': () => {
    // Show keyboard shortcuts help
    console.log('Showing keyboard shortcuts');
  },
  'escape': () => {
    // Close modals, dropdowns, etc.
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) {
      activeElement.blur();
    }
  },
  'ctrl+enter': () => {
    // Submit forms or confirm actions
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.click();
    }
  }
};
