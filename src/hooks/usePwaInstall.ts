import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true);
}

export type InstallState = 'android' | 'ios' | 'unavailable';

export function usePwaInstall() {
  const [installState, setInstallState] = useState<InstallState>('unavailable');

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstallState('unavailable');
      return;
    }

    if (isIos()) {
      setInstallState('ios');
      return;
    }

    if (isAndroid()) {
      setInstallState('android');
    }

    function handlePrompt(e: Event) {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setInstallState('android');
    }

    function handleInstalled() {
      deferredPrompt = null;
      setInstallState('unavailable');
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (deferredPrompt) {
      setInstallState('android');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    const promptEvent = deferredPrompt;
    deferredPrompt = null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      setInstallState('unavailable');
    } else if (isAndroid()) {
      setInstallState('android');
    } else {
      setInstallState('unavailable');
    }
    return true;
  }, []);

  return { installState, install };
}
