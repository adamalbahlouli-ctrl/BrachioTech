/**
 * BrachioTech — Marketplace Services Engine
 * Connects directly to Supabase `services`, `service_images`, and `reviews` tables.
 * Powers real-time search, category filtering, and dynamic Fiverr-style card rendering.
 * Changes made in upload.html reflect automatically here.
 */

import { supabase } from './supabaseClient.js';

// Category icons for badges and cards
const CATEGORY_ICONS = {
  'Web & Software Development': '🌐',
  'Graphic Design & UI/UX': '🎨',
  'Video Editing & Animation': '🎬',
  'Writing & Translation': '✍️',
  'AI & Automation': '🤖',
  'Mobile Apps & Games': '📱',
  'Digital Marketing & Social Media': '📈',
  'Audio & Music': '🎵',
  'Business & Data': '📊',
  'Photography & Image Editing': '📸',
  'Default': '⚡'
};

const SERVICE_PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338"%3E%3Crect width="600" height="338" fill="%23e5e7eb"/%3E%3Cpath d="M270 145h60v48h-60z" fill="none" stroke="%239ca3af" stroke-width="8"/%3E%3Ccircle cx="285" cy="158" r="6" fill="%239ca3af"/%3E%3Cpath d="m276 184 16-16 12 12 10-10 10 14" fill="none" stroke="%239ca3af" stroke-width="6"/%3E%3C/svg%3E';

// State
let allServices = [];
let activeCategory = 'All';
let searchQuery = '';

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Fetch all marketplace services from Supabase
async function fetchMarketplaceServices() {
  try {
    // 1. Fetch from Supabase services
    const { data: supaServices, error: servError } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (servError) {
      console.warn('[BrachioTech Marketplace] Supabase fetch error:', servError.message);
      return [];
    }

    if (!supaServices || supaServices.length === 0) {
      return [];
    }

    // 2. Fetch images
    const { data: images } = await supabase
      .from('service_images')
      .select('service_id, image_url, display_order')
      .order('display_order', { ascending: true });

    const imageMap = {};
    if (images) {
      images.forEach(img => {
        if (!imageMap[img.service_id]) {
          imageMap[img.service_id] = img.image_url;
        }
      });
    }

    // 3. Fetch reviews for aggregate rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('service_id, rating');

    const reviewsMap = {};
    if (reviews) {
      reviews.forEach(r => {
        if (!reviewsMap[r.service_id]) {
          reviewsMap[r.service_id] = { total: 0, count: 0 };
        }
        reviewsMap[r.service_id].total += (Number(r.rating) || 5);
        reviewsMap[r.service_id].count += 1;
      });
    }

    // Map into unified service objects
    const mapped = supaServices.map((svc, idx) => {
      const primaryImg = imageMap[svc.id] || SERVICE_PLACEHOLDER_IMAGE;
      const revData = reviewsMap[svc.id];
      const rating = revData && revData.count > 0 ? (revData.total / revData.count).toFixed(1) : null;
      const reviewsCount = revData ? revData.count : 0;

      return {
        id: svc.id,
        title: svc.title,
        category: svc.category || 'Digital Service',
        description: svc.description || '',
        price: svc.price || '',
        currency: svc.currency || 'USD',
        freelancer_name: svc.freelancer_name || '',
        freelancer_photo_url: svc.freelancer_photo_url || '',
        image: primaryImg,
        rating: rating,
        reviewsCount: reviewsCount,
        created_at: svc.created_at
      };
    });

    return mapped;

  } catch (err) {
    console.warn('[BrachioTech Marketplace] Unexpected error:', err);
    return [];
  }
}

// Render cards into the grid
function renderServicesGrid(servicesToDisplay) {
  const grid = document.getElementById('marketplace-services-grid');
  const counterEl = document.getElementById('marketplace-results-count');
  if (!grid) return;

  if (counterEl) {
    counterEl.textContent = `Showing ${servicesToDisplay.length} verified ${servicesToDisplay.length === 1 ? 'service' : 'services'}`;
  }

  if (servicesToDisplay.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 70px 20px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
        <h3 style="color:var(--text-primary); font-size: 1.3rem; margin-bottom: 8px;">${allServices.length ? 'No matching services found' : 'No services available at the moment'}</h3>
        <p style="color:var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">${allServices.length ? 'Try adjusting your search query or selecting a different category.' : 'Please check back later for available services.'}</p>
        ${allServices.length ? '<button type="button" class="btn btn-outline btn-sm" id="btn-reset-filters">Clear Filters</button>' : ''}
      </div>
    `;

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      activeCategory = 'All';
      searchQuery = '';
      const heroSearchInput = document.getElementById('hero-search-input');
      if (heroSearchInput) heroSearchInput.value = '';
      updateActiveTabUI('All');
      filterAndRender();
    });
    return;
  }

  grid.innerHTML = servicesToDisplay.map(svc => {
    const catIcon = CATEGORY_ICONS[svc.category] || CATEGORY_ICONS['Default'];
    let priceDisplay = 'Quote';
    if (svc.price) {
      const curr = (svc.currency || 'USD').toUpperCase();
      const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'CA$' };
      if (symbols[curr]) {
        priceDisplay = `${symbols[curr]}${svc.price}`;
      } else {
        priceDisplay = `${svc.price} ${curr}`;
      }
    }

    return `
      <article class="marketplace-card" data-id="${svc.id}">
        <div class="marketplace-card-thumb-wrap">
          <img
            src="${escapeHtml(svc.image)}"
            alt="${escapeHtml(svc.title)}"
            class="marketplace-card-thumb"
            loading="lazy"
            onerror="this.src='${SERVICE_PLACEHOLDER_IMAGE}'"
          />
          <span class="marketplace-card-badge-cat">
            ${catIcon} ${escapeHtml(svc.category)}
          </span>
          <span class="marketplace-card-badge-pro">
            ★ PRO
          </span>
        </div>

        <div class="marketplace-card-body">
          <div class="marketplace-provider-tag">
            ${svc.freelancer_photo_url 
              ? `<img src="${escapeHtml(svc.freelancer_photo_url)}" alt="${escapeHtml(svc.freelancer_name || 'Specialist')}" class="marketplace-provider-avatar" />`
              : `<div class="marketplace-provider-avatar">${escapeHtml((svc.freelancer_name || 'BT').substring(0, 2).toUpperCase())}</div>`
            }
            <span class="marketplace-provider-name">${escapeHtml(svc.freelancer_name || 'BrachioTech Talent')}</span>
          </div>

          <a href="service.html?id=${encodeURIComponent(svc.id)}" class="marketplace-card-title" title="${escapeHtml(svc.title)}">
            ${escapeHtml(svc.title)}
          </a>

          <p class="marketplace-card-desc">
            ${escapeHtml(svc.description || 'Professional digital service delivered according to high industry standards.')}
          </p>

          ${svc.reviewsCount > 0 ? `<div class="marketplace-card-rating">
            <span class="marketplace-stars-icon">★</span>
            <span class="marketplace-rating-num">${svc.rating}</span>
            <span class="marketplace-reviews-count">(${svc.reviewsCount} reviews)</span>
          </div>` : ''}

          <div class="marketplace-card-footer">
            <div class="marketplace-price-tag">
              <span class="marketplace-price-label">Starting at</span>
              <span class="marketplace-price-val">${priceDisplay}</span>
            </div>

            <a href="service.html?id=${encodeURIComponent(svc.id)}" class="btn btn-outline btn-sm">
              View Service
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Render featured grid on Home page
function renderFeaturedGrid(servicesToDisplay) {
  const grid = document.getElementById('featured-services-grid');
  if (!grid) return;

  const topServices = servicesToDisplay.slice(0, 6);
  if (topServices.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">No services available at the moment.</div>';
    return;
  }
  grid.innerHTML = topServices.map(svc => {
    const catIcon = CATEGORY_ICONS[svc.category] || CATEGORY_ICONS['Default'];
    const priceDisplay = svc.price ? `$${svc.price}` : 'Quote';

    return `
      <article class="marketplace-card" data-id="${svc.id}">
        <div class="marketplace-card-thumb-wrap">
          <img
            src="${escapeHtml(svc.image)}"
            alt="${escapeHtml(svc.title)}"
            class="marketplace-card-thumb"
            loading="lazy"
            onerror="this.src='${SERVICE_PLACEHOLDER_IMAGE}'"
          />
          <span class="marketplace-card-badge-cat">
            ${catIcon} ${escapeHtml(svc.category)}
          </span>
          <span class="marketplace-card-badge-pro">
            ★ PRO
          </span>
        </div>

        <div class="marketplace-card-body">
          <div class="marketplace-provider-tag">
            <div class="marketplace-provider-avatar">BT</div>
            <span class="marketplace-provider-name">BrachioTech Specialist</span>
          </div>

          <a href="service.html?id=${encodeURIComponent(svc.id)}" class="marketplace-card-title" title="${escapeHtml(svc.title)}">
            ${escapeHtml(svc.title)}
          </a>

          <p class="marketplace-card-desc">
            ${escapeHtml(svc.description || 'Professional digital service delivered according to high industry standards.')}
          </p>

          ${svc.reviewsCount > 0 ? `<div class="marketplace-card-rating">
            <span class="marketplace-stars-icon">★</span>
            <span class="marketplace-rating-num">${svc.rating}</span>
            <span class="marketplace-reviews-count">(${svc.reviewsCount} reviews)</span>
          </div>` : ''}

          <div class="marketplace-card-footer">
            <div class="marketplace-price-tag">
              <span class="marketplace-price-label">Starting at</span>
              <span class="marketplace-price-val">${priceDisplay}</span>
            </div>

            <a href="service.html?id=${encodeURIComponent(svc.id)}" class="btn btn-outline btn-sm">
              View Service
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Filter and render based on activeCategory and searchQuery
function filterAndRender() {
  let filtered = allServices;

  if (activeCategory && activeCategory !== 'All') {
    filtered = filtered.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  renderServicesGrid(filtered);
  renderFeaturedGrid(allServices);
}

// Update Active Tab UI
function updateActiveTabUI(category) {
  document.querySelectorAll('.marketplace-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === category);
  });
  document.querySelectorAll('.category-strip-btn').forEach(btn => {
    btn.classList.toggle('active', (btn.dataset.category || 'All') === category);
  });
}

// Select a category
export function setCategory(category) {
  activeCategory = category;
  updateActiveTabUI(category);
  filterAndRender();

  // If on services page with strip, scroll into view if needed
  const listSec = document.getElementById('marketplace-main');
  if (listSec && window.scrollY > 400) {
    listSec.scrollIntoView({ behavior: 'smooth' });
  }
}

// Setup Event Listeners
function setupMarketplaceListeners() {
  // 1. Horizontal Category Strip Buttons
  document.querySelectorAll('.category-strip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setCategory(btn.dataset.category || 'All');
    });
  });

  // Category horizontal strip scroll arrows & drag scrolling
  const strip = document.getElementById('category-scroll-strip');
  const leftArrow = document.getElementById('category-scroll-left');
  const rightArrow = document.getElementById('category-scroll-right');
  if (strip) {
    if (leftArrow) {
      leftArrow.addEventListener('click', () => {
        strip.scrollBy({ left: -280, behavior: 'smooth' });
      });
    }
    if (rightArrow) {
      rightArrow.addEventListener('click', () => {
        strip.scrollBy({ left: 280, behavior: 'smooth' });
      });
    }

    // Drag-to-scroll for mouse users
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    strip.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - strip.offsetLeft;
      scrollStart = strip.scrollLeft;
    });
    window.addEventListener('mouseup', () => { isDown = false; });
    strip.addEventListener('mouseleave', () => { isDown = false; });
    strip.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - strip.offsetLeft;
      const walk = (x - startX) * 1.5;
      strip.scrollLeft = scrollStart - walk;
    });

    // Horizontal wheel scroll support
    strip.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        strip.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // 2. Hero Quick Pills — always filter in place (homepage IS the marketplace)
  document.querySelectorAll('.hero-tag-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = pill.dataset.category;
      if (cat) setCategory(cat);
    });
  });

  // 3. Search Form & Input — always filter in place (no redirect needed)
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroSearchBtn = document.getElementById('hero-search-btn');

  function handleSearchSubmit() {
    const query = heroSearchInput ? heroSearchInput.value.trim() : '';
    searchQuery = query;
    filterAndRender();
  }

  if (heroSearchInput) {
    heroSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterAndRender();
    });

    heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
    });
  }

  if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearchSubmit();
    });
  }
}

// Initialize
async function initMarketplace() {
  const grid = document.getElementById('marketplace-services-grid');
  const featGrid = document.getElementById('featured-services-grid');
  
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <div class="admin-spinner" style="margin: 0 auto 16px;"></div>
        <p style="color:var(--text-muted); font-size: 0.95rem;">Loading verified marketplace services...</p>
      </div>
    `;
  }
  if (featGrid) {
    featGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <div class="admin-spinner" style="margin: 0 auto 16px;"></div>
        <p style="color:var(--text-muted); font-size: 0.95rem;">Loading featured services...</p>
      </div>
    `;
  }

  // Parse URL query parameters if present
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  const catParam = params.get('category');
  if (qParam) {
    searchQuery = qParam;
    const searchInput = document.getElementById('hero-search-input');
    if (searchInput) searchInput.value = qParam;
  }
  if (catParam) {
    activeCategory = catParam;
  }

  allServices = await fetchMarketplaceServices();
  setupMarketplaceListeners();
  updateActiveTabUI(activeCategory);
  filterAndRender();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMarketplace);
} else {
  initMarketplace();
}
