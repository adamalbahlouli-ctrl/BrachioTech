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

// Fallback image pool per category
const CATEGORY_DEFAULT_IMAGES = {
  'Web & Software Development': 'https://i.postimg.cc/ydL8G7V3/file-00000000d2c472468ac72117f2a0fe03.png',
  'Graphic Design & UI/UX': 'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png',
  'Video Editing & Animation': 'https://i.postimg.cc/X7sdS0vr/file-0000000032fc71f484618328d0b129e5.png',
  'Writing & Translation': 'https://i.postimg.cc/Y9YxNyMm/file-00000000429871f4a6ff4446f56b4694.png',
  'AI & Automation': 'https://i.postimg.cc/vTmkPsB4/file-00000000a21871f4b7a0488050ef5378.png',
  'Mobile Apps & Games': 'https://i.postimg.cc/tgVcfkpM/file-00000000217c71f495aa63acf81082ea.png',
  'Digital Marketing & Social Media': 'https://i.postimg.cc/bJqwwsCf/file-0000000057c07246b01cdc58bc37148e.png',
  'Audio & Music': 'https://i.postimg.cc/BbKTTgrV/file-00000000d1fc71f4b6e25ced763d0ae5.png',
  'Business & Data': 'https://i.postimg.cc/YqYZbbqM/file-00000000302471f4af9cb0b42211d742.png',
  'Photography & Image Editing': 'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png'
};

// Curated seed data if Supabase table is newly initialized
const MARKETPLACE_SEEDS = [
  {
    id: 'seed-1',
    title: 'Custom High-Performance Website & Web Application',
    category: 'Web & Software Development',
    description: 'Fully responsive, modern web applications built with React, Next.js, and Node.js with ultra-fast loading speeds and SEO optimization.',
    price: '79',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/ydL8G7V3/file-00000000d2c472468ac72117f2a0fe03.png'
  },
  {
    id: 'seed-2',
    title: 'Modern UI/UX Product Design & Figma Prototyping',
    category: 'Graphic Design & UI/UX',
    description: 'Pixel-perfect mobile and web user interface design with complete design systems, interactive Figma prototypes, and developer handoff.',
    price: '65',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png'
  },
  {
    id: 'seed-3',
    title: 'AI Automation Workflows & Intelligent Chatbots',
    category: 'AI & Automation',
    description: 'Integrate LLMs, AI customer support agents, automated CRM pipelines, and intelligent data extraction to scale your operations.',
    price: '120',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/vTmkPsB4/file-00000000a21871f4b7a0488050ef5378.png'
  },
  {
    id: 'seed-4',
    title: 'Native & Cross-Platform iOS & Android Mobile Apps',
    category: 'Mobile Apps & Games',
    description: 'Full-cycle mobile application development with Flutter or React Native, including offline storage, push notifications, and store release.',
    price: '190',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/tgVcfkpM/file-00000000217c71f495aa63acf81082ea.png'
  },
  {
    id: 'seed-5',
    title: 'High-Impact Social Media Video Editing & Motion Graphics',
    category: 'Video Editing & Animation',
    description: 'Engaging YouTube, TikTok, and commercial video editing with color grading, sound design, motion graphics, and subtitles.',
    price: '45',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/X7sdS0vr/file-0000000032fc71f484618328d0b129e5.png'
  },
  {
    id: 'seed-6',
    title: 'Professional Technical & Business Research Documentation',
    category: 'Writing & Translation',
    description: 'Meticulously researched industry reports, white papers, technical documentation, and market analysis with verified sources.',
    price: '35',
    rating: null,
    reviewsCount: 0,
    image: 'https://i.postimg.cc/Y9YxNyMm/file-00000000429871f4a6ff4446f56b4694.png'
  }
];

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
      .order('created_at', { ascending: false });

    if (servError) {
      console.warn('[BrachioTech Marketplace] Supabase fetch error, using seeds:', servError.message);
      return MARKETPLACE_SEEDS;
    }

    if (!supaServices || supaServices.length === 0) {
      return MARKETPLACE_SEEDS;
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
      const primaryImg = imageMap[svc.id] || CATEGORY_DEFAULT_IMAGES[svc.category] || CATEGORY_DEFAULT_IMAGES['Web & Software Development'];
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
    console.warn('[BrachioTech Marketplace] Unexpected error, using fallback:', err);
    return MARKETPLACE_SEEDS;
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
        <h3 style="color:var(--text-primary); font-size: 1.3rem; margin-bottom: 8px;">No matching services found</h3>
        <p style="color:var(--text-muted); font-size: 0.95rem; margin-bottom: 20px;">Try adjusting your search query or selecting a different category.</p>
        <button type="button" class="btn btn-outline btn-sm" id="btn-reset-filters">Clear Filters</button>
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
            onerror="this.src='https://via.placeholder.com/600x338/0a0f2e/6c63ff?text=BrachioTech'"
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
            onerror="this.src='https://via.placeholder.com/600x338/0a0f2e/6c63ff?text=BrachioTech'"
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
