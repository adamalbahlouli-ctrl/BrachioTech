/**
 * BrachioTech — Services Loader
 * Dynamically fetches and renders service cards from data/services.json
 * All product data is managed exclusively through the JSON file.
 */

(function () {
  'use strict';

  const SERVICES_URL = 'data/services.json';
  const PRODUCT_PAGE = 'Product.html';

  // ---- Inline fallback (used if fetch fails e.g. file:// protocol) ----
  const SERVICES_FALLBACK = [
    { id:'1', slug:'create-professional-website', title:'Create Professional Website', description:'We craft custom, fully responsive websites built with modern technologies focused on performance, SEO, and user experience.', price:'', category:'Web Development', image:'https://i.postimg.cc/ydL8G7V3/file-00000000d2c472468ac72117f2a0fe03.png', badge:'Best Seller', popular:true },
    { id:'2', slug:'research-writing', title:'Research Writing', description:'Professional academic and technical research writing tailored to your needs. Well-structured, thoroughly researched and properly cited content.', price:'10', category:'Writing', image:'https://i.postimg.cc/Y9YxNyMm/file-00000000429871f4a6ff4446f56b4694.png', badge:'Popular', popular:true },
    { id:'3', slug:'mobile-app-development', title:'Mobile App Development', description:'Native and cross-platform mobile applications for iOS and Android that deliver smooth, engaging experiences.', price:'', category:'Mobile Development', image:'https://i.postimg.cc/tgVcfkpM/file-00000000217c71f495aa63acf81082ea.png', badge:'Premium', popular:false },
    { id:'4', slug:'professional-css-design', title:'Professional CSS Design', description:'Transform your web presence with modern UI styling and responsive CSS development across all devices.', price:'', category:'Design', image:'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png', badge:'', popular:false },
    { id:'5', slug:'website-bug-fixing-security-audit', title:'Website Bug Fixing & Security Audit', description:'Comprehensive bug fixing, performance optimization, and security auditing for your existing website.', price:'', category:'Maintenance', image:'https://i.postimg.cc/vTmkPsB4/file-00000000a21871f4b7a0488050ef5378.png', badge:'Guaranteed', popular:false },
    { id:'6', slug:'one-month-technical-support', title:'One Month Technical Support', description:'Get dedicated technical support for an entire month ensuring your digital products run smoothly.', price:'', category:'Support', image:'https://i.postimg.cc/YqYZbbqM/file-00000000302471f4af9cb0b42211d742.png', badge:'Value Pick', popular:false },
    { id:'7', slug:'game-mod-development', title:'Game Mod Development', description:'Bring new life to your favorite games with custom mods designed and developed by experts.', price:'', category:'Gaming', image:'https://i.postimg.cc/X7sdS0vr/file-0000000032fc71f484618328d0b129e5.png', badge:'Unique', popular:false },
    { id:'8', slug:'professional-research-writing', title:'Professional Research Writing', description:'Well-structured, meticulously written professional reports, articles, and technical documentation.', price:'', category:'Writing', image:'https://i.postimg.cc/bJqwwsCf/file-0000000057c07246b01cdc58bc37148e.png', badge:'', popular:false },
    { id:'9', slug:'music-song-production', title:'Music & Song Production', description:'Professional music and song production combining human artistry with AI-assisted tools.', price:'', category:'Music', image:'https://i.postimg.cc/BbKTTgrV/file-00000000d1fc71f4b6e25ced763d0ae5.png', badge:'Creative', popular:false }
  ];

  // ---- Category Icon Map ----
  const CATEGORY_ICONS = {
    'Web Development':    '🌐',
    'Writing':            '✍️',
    'Mobile Development': '📱',
    'Design':             '🎨',
    'Maintenance':        '🔧',
    'Support':            '🛡️',
    'Gaming':             '🎮',
    'Music':              '🎵',
    'Default':            '⚡',
  };

  // ---- Render skeleton loading cards ----
  function renderSkeletons(grid, count = 6) {
    grid.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.setAttribute('aria-busy', 'true');
      card.setAttribute('aria-label', 'Loading service…');
      card.innerHTML = `
        <div class="service-card-image">
          <div class="skeleton" style="width:100%;height:100%;"></div>
        </div>
        <div class="service-card-body">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:20px;width:85%;margin-bottom:10px;"></div>
          <div class="skeleton" style="height:14px;width:100%;margin-bottom:8px;"></div>
          <div class="skeleton" style="height:14px;width:80%;margin-bottom:24px;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div class="skeleton" style="height:14px;width:35%;"></div>
            <div class="skeleton" style="height:36px;width:110px;border-radius:9999px;"></div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    }
  }

  // ---- Build a service card element ----
  function buildServiceCard(service) {
    const card = document.createElement('article');
    card.className = 'service-card reveal';
    card.setAttribute('data-id', service.id);
    card.setAttribute('data-slug', service.slug);
    card.setAttribute('aria-label', service.title);

    const categoryIcon = CATEGORY_ICONS[service.category] || CATEGORY_ICONS['Default'];

    const priceHTML = service.price
      ? `<div class="service-card-price">From <span>$${service.price}</span></div>`
      : `<div class="service-card-price" style="color:transparent;">—</div>`;

    const badgeHTML = service.badge
      ? `<span class="service-card-badge">${escapeHtml(service.badge)}</span>`
      : '';

    card.innerHTML = `
      <div class="service-card-image">
        <img
          src="${escapeHtml(service.image)}"
          alt="${escapeHtml(service.title)}"
          loading="lazy"
          width="600"
          height="338"
          onerror="this.src='https://via.placeholder.com/600x338/0a0f2e/6c63ff?text=BrachioTech'"
        />
        ${badgeHTML}
      </div>
      <div class="service-card-body">
        <div class="service-card-category">
          <span aria-hidden="true">${categoryIcon}</span> ${escapeHtml(service.category || 'Service')}
        </div>
        <h3 class="service-card-title">${escapeHtml(service.title)}</h3>
        <p class="service-card-desc">${escapeHtml(service.description)}</p>
        <div class="service-card-footer">
          ${priceHTML}
          <button class="btn-order" data-slug="${escapeHtml(service.slug)}" aria-label="Order ${escapeHtml(service.title)}">
            Order Now
          </button>
        </div>
      </div>
    `;

    // Navigate to Product.html with slug as query param
    card.addEventListener('click', (e) => {
      // Allow button clicks to propagate
      navigateToProduct(service.slug);
    });

    return card;
  }

  // ---- Navigate to Product page ----
  function navigateToProduct(slug) {
    window.location.href = `${PRODUCT_PAGE}?service=${encodeURIComponent(slug)}`;
  }

  // ---- Render service cards with staggered reveal ----
  function renderServices(grid, services) {
    grid.innerHTML = '';

    if (!services || services.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
          <p style="font-size:1.1rem;">No services available at the moment.</p>
        </div>
      `;
      return;
    }

    services.forEach((service, index) => {
      const card = buildServiceCard(service);
      // Stagger reveal delay
      const delay = Math.min(index * 0.08, 0.5);
      card.style.transitionDelay = `${delay}s`;
      grid.appendChild(card);
    });

    // Trigger reveal animations
    requestAnimationFrame(() => {
      const cards = grid.querySelectorAll('.reveal');
      cards.forEach(card => card.classList.add('visible'));
    });
  }

  // ---- Fetch from JSON ----
  async function fetchServices() {
    const response = await fetch(SERVICES_URL, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid services data format');
    return data;
  }

  // ---- Error state ----
  function renderError(grid, message) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <div style="font-size:2.5rem;margin-bottom:16px;">⚠️</div>
        <p style="color:var(--text-muted);font-size:1rem;">
          Unable to load services. Please try again later.
        </p>
        <p style="color:var(--text-muted);font-size:0.8rem;margin-top:8px;opacity:0.6;">${message}</p>
        <button onclick="window.location.reload()" class="btn btn-outline btn-sm" style="margin-top:24px;">
          Retry
        </button>
      </div>
    `;
  }

  // ---- Main Init ----
  async function init() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    renderSkeletons(grid, 9);

    let services;
    try {
      services = await fetchServices();
    } catch (err) {
      console.warn('[NeuralWorks] fetch failed, using inline fallback:', err.message);
      services = SERVICES_FALLBACK;
    }

    // Small delay so skeletons are visible (better UX perception)
    setTimeout(() => renderServices(grid, services), 400);
  }

  // ---- Utility: escape HTML ----
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for reuse
  window.NWServices = { fetchServices, navigateToProduct };
})();
