/**
 * BrachioTech — Automatic System Theme Manager
 * Automatically synchronizes website theme (dark/light) with the user's device/OS preference.
 * Listens in real-time to system theme changes without manual toggle intervention.
 */

(function () {
  'use strict';

  function applySystemTheme(isDark) {
    var theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Initial detection
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  applySystemTheme(darkQuery.matches);

  // Real-time synchronization when user toggles OS theme
  if (darkQuery.addEventListener) {
    darkQuery.addEventListener('change', function (e) {
      applySystemTheme(e.matches);
    });
  } else if (darkQuery.addListener) {
    // Fallback for older browsers
    darkQuery.addListener(function (e) {
      applySystemTheme(e.matches);
    });
  }
})();
