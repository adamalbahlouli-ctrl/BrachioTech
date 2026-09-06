/**
 * BrachioTech — Authentication Handler
 * Handles Google OAuth login, logout, and real-time auth state updates with Supabase.
 */

import { supabase } from './supabaseClient.js';

// ============================================================
// CONFIGURATION: Admin Email (Set your admin email here)
// ============================================================
export const ADMIN_EMAIL = 'adamalbahlouli@gmail.com';

/**
 * Trigger Google OAuth login
 */
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      console.error('[BrachioTech Auth] Sign in error:', error.message);
      if (typeof window.showToast === 'function') {
        window.showToast(error.message, 'error');
      } else {
        alert('Authentication error: ' + error.message);
      }
    }
  } catch (err) {
    console.error('[BrachioTech Auth] Unexpected error during sign in:', err);
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[BrachioTech Auth] Sign out error:', error.message);
    }
  } catch (err) {
    console.error('[BrachioTech Auth] Unexpected error during sign out:', err);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
  } catch (err) {
    return null;
  }
}
window.getCurrentAuthUser = getCurrentUser;

/**
 * Update UI across all navigation containers (desktop and mobile)
 * @param {object|null} user 
 */
export function updateAuthUI(user) {
  window.currentAuthUser = user;
  const authContainers = document.querySelectorAll('.auth-container');

  authContainers.forEach((container) => {
    const loginBtn = container.querySelector('.auth-login-btn');
    const userMenu = container.querySelector('.auth-user-menu');
    const userAvatar = container.querySelector('.auth-user-avatar');
    const userName = container.querySelector('.auth-user-name');
    const adminLink = container.querySelector('.auth-admin-link');

    if (user) {
      // User is logged in
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      setupFreelancerLink(userMenu, user);

      const metadata = user.user_metadata || {};
      const displayName = metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User';
      const avatarUrl = metadata.avatar_url || metadata.picture || '';

      if (userName) {
        userName.textContent = displayName;
        userName.title = user.email || displayName;
      }

      if (userAvatar) {
        if (avatarUrl) {
          userAvatar.src = avatarUrl;
          userAvatar.alt = displayName;
          userAvatar.style.display = 'block';
        } else {
          // Fallback avatar icon/placeholder
          userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6c63ff&color=fff&size=64`;
          userAvatar.alt = displayName;
          userAvatar.style.display = 'block';
        }
      }

      // Show admin link if user is admin
      if (adminLink) {
        if (user.email === ADMIN_EMAIL) {
          adminLink.style.display = 'inline-flex';
        } else {
          adminLink.style.display = 'none';
        }
      }
    } else {
      // User is logged out
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userMenu) userMenu.style.display = 'none';
      if (adminLink) adminLink.style.display = 'none';
      const freelancerLink = userMenu?.querySelector('.auth-freelancer-link');
      if (freelancerLink) freelancerLink.remove();
    }
  });
}

async function setupFreelancerLink(userMenu, user) {
  if (!userMenu) return;

  let link = userMenu.querySelector('.auth-freelancer-link');
  if (!link) {
    link = document.createElement('a');
    link.className = 'auth-freelancer-link btn btn-outline btn-sm';
    link.textContent = 'Freelancer';
    link.href = 'freelancer-activate.html';
    link.title = 'Freelancer account';

    const logoutButton = userMenu.querySelector('.auth-logout-btn');
    if (logoutButton) userMenu.insertBefore(link, logoutButton);
    else userMenu.appendChild(link);
  }

  const { data: profile, error } = await supabase
    .from('freelancer_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('[BrachioTech Auth] Freelancer profile check failed:', error.message);
    return;
  }

  link.href = profile ? 'freelancer-services.html' : 'freelancer-activate.html';
}

/**
 * Initialize Authentication listeners and state
 */
export async function initAuth() {
  // Bind click handlers for all login/logout elements
  document.addEventListener('click', (e) => {
    const loginTrigger = e.target.closest('.auth-login-btn');
    if (loginTrigger) {
      e.preventDefault();
      signInWithGoogle();
      return;
    }

    const logoutTrigger = e.target.closest('.auth-logout-btn');
    if (logoutTrigger) {
      e.preventDefault();
      signOut();
      return;
    }
  });

  // Check initial session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthUI(session ? session.user : null);
  } catch (err) {
    console.warn('[NeuralWorks Auth] Initial session check:', err);
    updateAuthUI(null);
  }

  // Subscribe to auth state changes for real-time reactivity without page reload
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session ? session.user : null;
    updateAuthUI(user);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
