'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';

export default function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  // Use a ref for the current pathname to avoid re-adding the listener on every navigation
  const pathnameRef = useRef(pathname);
  
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let handler: any;
    
    const setup = async () => {
      // Remove any existing listeners first to be absolutely sure
      // (Though removeAllListeners might be too aggressive, remove() is enough)
      
      handler = await App.addListener('backButton', ({ canGoBack }) => {
        // Log to help debug in development
        console.log(`[BackButton] Current Path: ${pathnameRef.current}, canGoBack: ${canGoBack}`);
        
        // Define root paths where the app should exit
        const isRootPage = pathnameRef.current === '/' || pathnameRef.current === '/home';
        
        if (isRootPage) {
          console.log('[BackButton] On root page, exiting app...');
          App.exitApp();
        } else {
          if (canGoBack) {
            console.log('[BackButton] Subpage with history, going back...');
            router.back();
          } else {
            console.log('[BackButton] Subpage without history, navigating to root...');
            // If we're on a subpage but have no history (e.g., direct link),
            // navigate to root instead of exiting for a better UX.
            router.push('/');
          }
        }
      });
    };

    setup();

    return () => {
      if (handler) {
        console.log('[BackButton] Removing listener');
        handler.remove();
      }
    };
  }, [router]);

  return null;
}
