/**
 * BrachioTech — User announcements
 * Shows the newest announcement once per signed-in user.
 */

import { supabase } from './supabaseClient.js';

const SESSION_KEY_PREFIX = 'brachiotech-announcement-seen:';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function closeAnnouncement() {
  const modal = document.getElementById('announcement-modal');
  if (!modal) return;
  modal.classList.remove('visible');
  setTimeout(() => modal.remove(), 220);
}

function renderAnnouncement(announcement, user) {
  if (document.getElementById('announcement-modal')) return;

  sessionStorage.setItem(`${SESSION_KEY_PREFIX}${user.id}`, announcement.id);

  const modal = document.createElement('div');
  modal.id = 'announcement-modal';
  modal.className = 'announcement-modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'announcement-modal-title');
  modal.innerHTML = `
    <div class="announcement-modal-card">
      <button type="button" class="announcement-modal-close" aria-label="Close announcement">&times;</button>
      <div class="announcement-modal-icon" aria-hidden="true">!</div>
      <p class="announcement-modal-eyebrow">New announcement</p>
      <h2 class="announcement-modal-title" id="announcement-modal-title">Important update</h2>
      <p class="announcement-modal-content">${escapeHtml(announcement.content)}</p>
      <button type="button" class="btn btn-primary announcement-modal-button">Got it</button>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('visible'));
  modal.querySelector('.announcement-modal-close').addEventListener('click', closeAnnouncement);
  modal.querySelector('.announcement-modal-button').addEventListener('click', closeAnnouncement);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeAnnouncement();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeAnnouncement();
  }, { once: true });

  supabase.from('announcement_views').insert({
    announcement_id: announcement.id,
    user_id: user.id,
    seen_at: new Date().toISOString()
  }).then(({ error }) => {
    if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
      console.warn('[BrachioTech Announcements] Could not save view:', error.message);
    }
  });
}

async function checkLatestAnnouncement(user) {
  if (!user) return;

  const { data: announcement, error: announcementError } = await supabase
    .from('announcements')
    .select('id, content, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (announcementError || !announcement) return;

  if (sessionStorage.getItem(`${SESSION_KEY_PREFIX}${user.id}`) === announcement.id) return;

  const { data: view, error: viewError } = await supabase
    .from('announcement_views')
    .select('id')
    .eq('announcement_id', announcement.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (viewError || view) {
    if (view) sessionStorage.setItem(`${SESSION_KEY_PREFIX}${user.id}`, announcement.id);
    return;
  }

  renderAnnouncement(announcement, user);
}

async function initAnnouncements() {
  const { data: { session } } = await supabase.auth.getSession();
  checkLatestAnnouncement(session?.user);

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    if (nextSession?.user) {
      checkLatestAnnouncement(nextSession.user);
    } else {
      closeAnnouncement();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnnouncements);
} else {
  initAnnouncements();
}