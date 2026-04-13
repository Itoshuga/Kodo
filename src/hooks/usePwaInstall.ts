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
  const [canPromptInstall, setCanPromptInstall] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setInstallState('unavailable');
      setCanPromptInstall(false);
      return;
    }

    if (isIos()) {
      setInstallState('ios');
      setCanPromptInstall(false);
      return;
    }

    if (isAndroid()) {
      setInstallState('android');
      setCanPromptInstall(Boolean(deferredPrompt));
    }

    function handlePrompt(e: Event) {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setInstallState('android');
      setCanPromptInstall(true);
    }

    function handleInstalled() {
      deferredPrompt = null;
      setInstallState('unavailable');
      setCanPromptInstall(false);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (deferredPrompt) {
      setInstallState('android');
      setCanPromptInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    let shown = true;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setInstallState('unavailable');
      setCanPromptInstall(false);
    }
    return shown;
  }, []);

  return { installState, install, canPromptInstall };
}
