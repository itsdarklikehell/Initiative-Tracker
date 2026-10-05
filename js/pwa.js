/**
 * PWA Initialization for The DM's Toolbox
 * Registers the service worker and handles PWA install prompt
 */

(function() {
  'use strict';

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                showUpdateNotification(newWorker);
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    });
  }

  // Handle service worker controller change
  let refreshing = false;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }

  // Show update notification
  function showUpdateNotification(worker) {
    // Create a subtle notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 10px; right: 10px; z-index: 9999; max-width: 350px;';
    notification.innerHTML = `
      <strong>Update Available</strong><br>
      A new version of The DM's Toolbox is available.
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      <div class="mt-2">
        <button class="btn btn-sm btn-primary" id="updateAppBtn">Update Now</button>
      </div>
    `;
    document.body.appendChild(notification);

    notification.querySelector('#updateAppBtn').addEventListener('click', () => {
      worker.postMessage('skipWaiting');
      notification.remove();
    });
  }

  // PWA Install Prompt
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default browser install prompt
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install button (if it exists)
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'inline-block';
      installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
        });
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
})();
