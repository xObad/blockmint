import { useEffect } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle keyboard appearance and adjust viewport/scroll position
 * Ensures input fields remain visible when keyboard is shown
 * Adds padding and scrolls to keep input above keyboard
 */
export function useKeyboardAdjustment() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleKeyboardWillShow = (info: { keyboardHeight: number }) => {
      const keyboardHeight = info.keyboardHeight;
      
      // Add class to body for CSS-based adjustments
      document.body.classList.add('keyboard-open');
      document.body.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      
      // Move fixed dialogs up by adjusting their transform
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach((dialog) => {
        const el = dialog as HTMLElement;
        el.style.top = '20%';
        el.style.maxHeight = `calc(100vh - ${keyboardHeight}px - 80px)`;
      });
      
      // Add padding to body for scrollable content
      document.body.style.paddingBottom = `${keyboardHeight}px`;
      
      // Scroll focused element into view
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    };

    const handleKeyboardDidShow = (info: { keyboardHeight: number }) => {
      // Fine-tune adjustment after keyboard is fully shown
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          const rect = activeElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const keyboardTop = viewportHeight - info.keyboardHeight;
          
          // Ensure input is centered in visible area
          const visibleHeight = keyboardTop;
          const targetPosition = visibleHeight / 2;
          const currentPosition = rect.top + (rect.height / 2);
          const scrollOffset = currentPosition - targetPosition;
          
          if (Math.abs(scrollOffset) > 10) { // Only adjust if significantly off-center
            window.scrollBy({ 
              top: scrollOffset, 
              behavior: 'smooth' 
            });
          }
        }
      }, 50);
    };

    const handleKeyboardWillHide = () => {
      // Remove keyboard class
      document.body.classList.remove('keyboard-open');
      document.body.style.removeProperty('--keyboard-height');
      
      // Reset dialog positions
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach((dialog) => {
        const el = dialog as HTMLElement;
        el.style.top = '';
        el.style.maxHeight = '';
      });
      
      // Remove padding when keyboard hides
      document.body.style.paddingBottom = '0px';
    };

    // Add listeners
    Keyboard.addListener('keyboardWillShow', handleKeyboardWillShow);
    Keyboard.addListener('keyboardDidShow', handleKeyboardDidShow);
    Keyboard.addListener('keyboardWillHide', handleKeyboardWillHide);

    // Cleanup
    return () => {
      Keyboard.removeAllListeners();
      document.body.style.paddingBottom = '0px';
    };
  }, []);
}
