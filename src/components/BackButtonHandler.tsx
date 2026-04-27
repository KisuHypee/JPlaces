'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { executeBackActions } from '@/lib/backButtonRegistry';

export default function BackButtonHandler() {
  const pathname = usePathname();

  // Use a ref for the current pathname to avoid re-adding the listener on every navigation
  const pathnameRef = useRef(pathname);
  
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // Only register the listener on native platforms (Android)
    if (!Capacitor.isNativePlatform()) return;

    let handler: any;
    
    const setup = async () => {
      handler = await App.addListener('backButton', () => {
        // 1. First, try to execute registered back actions (e.g., closing sidebars/modals)
        if (executeBackActions()) {
          console.log('[BackButton] Action handled by registry');
          return;
        }
        
        // 2. If no component handled it, determine if we should exit or navigate back
        const isRootPage = pathnameRef.current === '/' || pathnameRef.current === '/home';
        
        if (isRootPage) {
          console.log('[BackButton] On root page, exiting app...');
          App.exitApp();
        } else {
          console.log('[BackButton] Subpage, navigating back via window.history.back()');
          // Using window.history.back() directly as it's more immediate and 
          // consistent with the SpendPare implementation.
          window.history.back();
        }
      });
    };

    setup();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []); // router is not needed here as we use window.history.back()

  return null;
}
