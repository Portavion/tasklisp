import { registerSW } from 'virtual:pwa-register';

export function registerPwa(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error('PWA service worker registration failed', error);
    }
  });
}
