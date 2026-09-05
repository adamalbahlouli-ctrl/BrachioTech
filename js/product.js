/**
 * BrachioTech — Product Page Script
 * Supabase-first service loading with JSON fallback.
 * Renders title, category, description, image gallery/slider,
 * social links with platform icons, and verified reviews.
 */

import { supabase } from './supabaseClient.js';

const SERVICES_URL = 'data/services.json';

// Platform SVG Icons
const PLATFORM_ICONS = {
  WhatsApp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  Instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  X: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  Facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.666.28-1.799 1.242-.058.415-.058.918-.058 1.428v1.314h3.757l-.49 3.667h-3.267v7.98H9.101z"/></svg>',
  TikTok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  LinkedIn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  YouTube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  Telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.946z"/></svg>',
  Snapchat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.02c-4.42 0-8 3.58-8 8 0 1.25.3 2.43.83 3.48-.48.9-1.25 1.58-1.83 2.05-.18.15-.22.41-.09.6.13.2.37.28.58.19.78-.33 1.9-.53 2.87-.27.27.07.56.09.84.09.28 0 .56-.04.83-.12.44-.13.88-.34 1.32-.44.75-.17 1.55-.1 2.3.17.47.17.92.42 1.37.58.26.09.53.14.81.14.28 0 .55-.05.81-.14.45-.16.9-.41 1.37-.58.75-.27 1.55-.34 2.3-.17.44.1.88.31 1.32.44.27.08.55.12.83.12.28 0 .57-.02.84-.09.97-.26 2.09-.06 2.87.27.21.09.45.01.58-.19.13-.19.09-.45-.09-.6-.58-.47-1.35-1.15-1.83-2.05.53-1.05.83-2.23.83-3.48 0-4.42-3.58-8-8-8z"/></svg>',
  Behance: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v2h7V7zm1.726 10c-.442 1.297-2.029 3-4.976 3-3.401 0-5.75-2.422-5.75-5.719 0-3.375 2.375-5.781 5.625-5.781 3.562 0 5.375 2.594 5.375 5.719 0 .578-.078 1.172-.156 1.562h-8.25c.109 1.625 1.422 2.656 3.156 2.656 1.484 0 2.453-.656 2.922-1.438h2.054zm-2.5-3.5c-.094-1.344-.984-2.188-2.469-2.188-1.547 0-2.469.875-2.625 2.188h5.094zM7.228 11.238c.781-.469 1.312-1.281 1.312-2.344 0-2.25-1.75-3.894-4.5-3.894H0v15h4.406c2.812 0 4.875-1.688 4.875-4.125 0-1.438-.75-2.656-2.053-3.238v-.094zm-4.478-4.113h1.469c1.172 0 1.953.672 1.953 1.703 0 1.078-.781 1.766-1.953 1.766H2.75V7.125zm1.656 10.75H2.75v-4.078h1.656c1.375 0 2.297.797 2.297 2.031 0 1.266-.922 2.047-2.297 2.047z"/></svg>'
};

// Fallback services if Supabase or fetch unavailable
const SERVICES_FALLBACK = [
  { id:'1', slug:'create-professional-website', title:'Create Professional Website', subtitle:'Modern, Responsive & High-Performance', description:'We craft custom, fully responsive websites built with modern technologies. From landing pages to complex web applications, every pixel is designed with your brand in mind. We focus on performance, SEO, and user experience to ensure your online presence stands out.', price:'', currency:'USD', category:'Web Development', image:'https://i.postimg.cc/ydL8G7V3/file-00000000d2c472468ac72117f2a0fe03.png', features:['Custom responsive design','SEO optimized structure','Fast loading performance','Cross-browser compatibility','Modern animations & effects','CMS integration available'], technologies:['HTML5','CSS3','JavaScript','React','Next.js'], delivery_time:'5–10 business days', support:'30 days post-delivery', rating:'4.9', reviews:'128', status:'available', badge:'Best Seller', popular:true, recommended:true },
  { id:'2', slug:'research-writing', title:'Research Writing', subtitle:'Academic & Technical Excellence', description:'Professional academic and technical research writing tailored to your needs. We produce well-structured, thoroughly researched, and properly cited content for reports, papers, theses, and technical documentation.', price:'10', currency:'USD', category:'Writing', image:'https://i.postimg.cc/Y9YxNyMm/file-00000000429871f4a6ff4446f56b4694.png', features:['Thorough research & sourcing','Proper academic citations','Plagiarism-free content','Multiple format support','Revision rounds included','On-time delivery'], technologies:['APA','MLA','Chicago','IEEE'], delivery_time:'3–7 business days', support:'Unlimited revisions for 14 days', rating:'4.8', reviews:'95', status:'available', badge:'Popular', popular:true, recommended:false },
  { id:'3', slug:'mobile-app-development', title:'Mobile App Development', subtitle:'Native & Cross-Platform Applications', description:'We build native and cross-platform mobile applications for iOS and Android that deliver smooth, engaging experiences. From ideation to deployment, our apps are built for performance, scalability, and user delight.', price:'', currency:'USD', category:'Mobile Development', image:'https://i.postimg.cc/tgVcfkpM/file-00000000217c71f495aa63acf81082ea.png', features:['iOS & Android support','Cross-platform development','Native performance','Push notifications','Offline functionality','App store submission'], technologies:['React Native','Flutter','Swift','Kotlin'], delivery_time:'2–6 weeks', support:'60 days post-launch', rating:'4.9', reviews:'74', status:'available', badge:'Premium', popular:false, recommended:true },
  { id:'4', slug:'professional-css-design', title:'Professional CSS Design', subtitle:'Modern UI Styling & Responsive Layouts', description:'Transform your web presence with modern UI styling and responsive CSS development. We create pixel-perfect designs that adapt beautifully across all devices and screen sizes, with smooth animations and premium visual polish.', price:'', currency:'USD', category:'Design', image:'https://i.postimg.cc/Bn5Lg917/file-00000000480072468e46a0d7d710e9c3.png', features:['Responsive layouts','CSS animations & transitions','Cross-browser support','Design system creation','Dark/Light theme support','Performance optimized'], technologies:['CSS3','SASS/SCSS','Tailwind','CSS Grid','Flexbox'], delivery_time:'2–5 business days', support:'14 days post-delivery', rating:'4.7', reviews:'88', status:'available', badge:'', popular:false, recommended:false },
  { id:'5', slug:'website-bug-fixing-security-audit', title:'Website Bug Fixing & Security Audit', subtitle:'Debugging, Optimization & Security', description:'Comprehensive bug fixing, performance optimization, and security auditing for your existing website. We identify vulnerabilities, fix critical issues, and implement best practices to keep your site fast, secure, and reliable.', price:'', currency:'USD', category:'Maintenance', image:'https://i.postimg.cc/vTmkPsB4/file-00000000a21871f4b7a0488050ef5378.png', features:['Full bug diagnosis & fixes','Security vulnerability scanning','Performance optimization','Code refactoring','SSL & HTTPS setup','Detailed audit report'], technologies:['OWASP','Lighthouse','Chrome DevTools','Wireshark'], delivery_time:'1–3 business days', support:'30 days guarantee', rating:'5.0', reviews:'52', status:'available', badge:'Guaranteed', popular:false, recommended:false },
  { id:'6', slug:'one-month-technical-support', title:'One Month Technical Support', subtitle:'30 Days of Continuous Assistance', description:'Get dedicated technical support for an entire month. Whether it\'s troubleshooting, updates, feature additions, or general assistance, our team is available to ensure your digital products run smoothly around the clock.', price:'', currency:'USD', category:'Support', image:'https://i.postimg.cc/YqYZbbqM/file-00000000302471f4af9cb0b42211d742.png', features:['30 days of continuous support','Priority response time','Bug fixes included','Minor feature updates','Progress reports','24/7 availability'], technologies:['Email','WhatsApp','Slack','GitHub'], delivery_time:'Starts immediately', support:'Full 30-day coverage', rating:'4.9', reviews:'41', status:'available', badge:'Value Pick', popular:false, recommended:false },
  { id:'7', slug:'game-mod-development', title:'Game Mod Development', subtitle:'Custom Modifications for Popular Games', description:'Bring new life to your favorite games with custom mods designed and developed by experts. From gameplay tweaks to full conversion mods, we create high-quality modifications that enhance the gaming experience.', price:'', currency:'USD', category:'Gaming', image:'https://i.postimg.cc/X7sdS0vr/file-0000000032fc71f484618328d0b129e5.png', features:['Custom gameplay mechanics','New assets & textures','Compatibility testing','Mod documentation','Installation support','Updates & patches'], technologies:['Lua','C++','Python','Unity','Unreal Engine'], delivery_time:'1–4 weeks', support:'14 days post-delivery', rating:'4.8', reviews:'63', status:'available', badge:'Unique', popular:false, recommended:false },
  { id:'8', slug:'professional-research-writing', title:'Professional Research Writing', subtitle:'Reports, Articles & Documentation', description:'Well-structured, meticulously written professional reports, articles, and technical documentation. Ideal for businesses, researchers, and organizations needing high-quality written content that communicates complex ideas clearly.', price:'', currency:'USD', category:'Writing', image:'https://i.postimg.cc/bJqwwsCf/file-0000000057c07246b01cdc58bc37148e.png', features:['Professional tone & structure','Data-driven insights','Executive summaries','Visual infographic support','Multiple delivery formats','Confidentiality guaranteed'], technologies:['Word','LaTeX','Google Docs','Notion'], delivery_time:'3–7 business days', support:'Revisions for 21 days', rating:'4.8', reviews:'79', status:'available', badge:'', popular:false, recommended:false },
  { id:'9', slug:'music-song-production', title:'Music & Song Production', subtitle:'AI-Assisted & Professional Music Creation', description:'Professional music and song production combining human artistry with AI-assisted tools. Whether you need a full track, jingle, podcast intro, or custom soundtrack, we deliver broadcast-quality audio that resonates.', price:'', currency:'USD', category:'Music', image:'https://i.postimg.cc/BbKTTgrV/file-00000000d1fc71f4b6e25ced763d0ae5.png', features:['Original compositions','AI-enhanced production','Professional mixing & mastering','Multiple genre support','Stems & project files included','Full commercial rights'], technologies:['Ableton Live','FL Studio','Suno AI','Logic Pro'], delivery_time:'3–10 business days', support:'2 revision rounds', rating:'4.9', reviews:'57', status:'available', badge:'Creative', popular:false, recommended:false }
];

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('service') || '';
}

function buildStars(rating) {
  const r = parseFloat(rating) || 0;
  const fullStars = Math.floor(r);
  const halfStar  = r % 1 >= 0.5;
  const empty     = 5 - fullStars - (halfStar ? 1 : 0);
  let html = '';
  for (let i = 0; i < fullStars; i++) html += '★';
  if (halfStar) html += '✭';
  for (let i = 0; i < empty; i++) html += '☆';
  return html;
}

// Setup Gallery Slider
function setupGallery(images, fallbackImage, title) {
  const mainImg = document.getElementById('product-main-image');
  const navWrap = document.getElementById('product-gallery-nav');
  const thumbsWrap = document.getElementById('product-gallery-thumbs');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  let imageList = [];
  if (Array.isArray(images) && images.length > 0) {
    imageList = images.map(img => typeof img === 'string' ? img : img.image_url);
  } else if (fallbackImage) {
    imageList = [fallbackImage];
  }

  if (imageList.length === 0) {
    if (mainImg) mainImg.style.display = 'none';
    return;
  }

  let currentIndex = 0;

  function updateImage(index) {
    if (index < 0) index = imageList.length - 1;
    if (index >= imageList.length) index = 0;
    currentIndex = index;

    if (mainImg) {
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = imageList[currentIndex];
        mainImg.alt = `${title} — Image ${currentIndex + 1}`;
        mainImg.style.opacity = '1';
      }, 120);
    }

    if (thumbsWrap) {
      thumbsWrap.querySelectorAll('.gallery-thumb-item').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentIndex);
      });
    }
  }

  // Set initial image
  updateImage(0);

  // If multiple images exist, activate arrows and thumbs
  if (imageList.length > 1) {
    if (navWrap) navWrap.style.display = 'flex';
    if (thumbsWrap) {
      thumbsWrap.style.display = 'flex';
      thumbsWrap.innerHTML = imageList.map((url, idx) => `
        <div class="gallery-thumb-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
          <img src="${escapeHtml(url)}" alt="Thumb ${idx + 1}" loading="lazy" />
        </div>
      `).join('');

      thumbsWrap.querySelectorAll('.gallery-thumb-item').forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = parseInt(thumb.dataset.idx, 10);
          updateImage(idx);
        });
      });
    }

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.preventDefault();
        updateImage(currentIndex - 1);
      };
    }
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.preventDefault();
        updateImage(currentIndex + 1);
      };
    }
  } else {
    if (navWrap) navWrap.style.display = 'none';
    if (thumbsWrap) thumbsWrap.style.display = 'none';
  }
}

// Render the product page
function renderProduct(service, images = [], links = []) {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-error').style.display = 'none';
  const content = document.getElementById('product-content');
  content.style.display = 'block';
  content.removeAttribute('aria-hidden');

  // Title and Meta
  document.title = `${service.title} — BrachioTech`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = service.description || service.title;

  // Breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = service.title;

  // Image Gallery
  setupGallery(images, service.image, service.title);

  // Badges
  const badgesWrap = document.getElementById('product-image-badges');
  if (badgesWrap) {
    let badgesHTML = '';
    if (service.popular) {
      badgesHTML += `<span class="product-badge product-badge-popular">Popular</span>`;
    }
    if (service.recommended) {
      badgesHTML += `<span class="product-badge product-badge-recommended">Recommended</span>`;
    }
    if (service.badge) {
      badgesHTML += `<span class="product-badge product-badge-label">${escapeHtml(service.badge)}</span>`;
    }
    badgesWrap.innerHTML = badgesHTML;
  }

  // Category
  const catEl = document.getElementById('product-category');
  if (catEl) catEl.textContent = service.category || 'Service';

  // Title & Subtitle
  setText('product-title', service.title);
  setText('product-subtitle', service.subtitle || service.category);

  // Rating
  const ratingRow = document.getElementById('product-rating-row');
  if (service.rating && ratingRow) {
    document.getElementById('product-stars').innerHTML = buildStars(service.rating);
    setText('product-rating-value', service.rating);
    setText('product-reviews', service.reviews ? `(${service.reviews} reviews)` : '');
  } else if (ratingRow) {
    ratingRow.style.display = 'none';
  }

  // Price
  const priceEl = document.getElementById('product-price');
  if (service.price && priceEl) {
    priceEl.textContent = `From $${service.price} ${service.currency || 'USD'}`;
  } else if (priceEl) {
    priceEl.textContent = 'Contact for Pricing';
  }

  // Meta Grid
  const metaGrid = document.getElementById('product-meta-grid');
  if (metaGrid) {
    const metas = [];
    if (service.delivery_time) metas.push({ label: 'Delivery Time', value: service.delivery_time });
    if (service.support) metas.push({ label: 'Support', value: service.support });
    if (service.category) metas.push({ label: 'Category', value: service.category });
    if (service.created_at) metas.push({ label: 'Added', value: formatDate(service.created_at) });

    metaGrid.innerHTML = metas.map(m => `
      <div class="product-meta-item">
        <span class="product-meta-label">${escapeHtml(m.label)}</span>
        <span class="product-meta-value">${escapeHtml(m.value)}</span>
      </div>
    `).join('');
  }

  // Description
  setText('product-description', service.description || 'No detailed description provided.');

  // Social & Platform Links (Supabase service_links)
  const socialWrap = document.getElementById('product-social-links-wrap');
  const socialButtons = document.getElementById('product-social-buttons');

  if (socialWrap && socialButtons) {
    if (Array.isArray(links) && links.length > 0) {
      socialWrap.style.display = 'block';
      socialButtons.innerHTML = links.map(link => {
        const plat = link.platform || 'Link';
        const icon = PLATFORM_ICONS[plat] || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
        const platClass = `plat-${plat.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        return `
          <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="social-platform-btn ${platClass}">
            ${icon}
            <span>${escapeHtml(plat)}</span>
          </a>
        `;
      }).join('');

      // If WhatsApp exists in links, update WhatsApp button CTA
      const waLink = links.find(l => l.platform && l.platform.toLowerCase() === 'whatsapp');
      if (waLink) {
        const waCta = document.getElementById('product-whatsapp-cta');
        if (waCta) waCta.href = waLink.url;
      }
    } else {
      socialWrap.style.display = 'none';
    }
  }

  // Features list
  const featuresList = document.getElementById('product-features-list');
  const featuresPanel = document.getElementById('product-features-panel');
  if (featuresList && Array.isArray(service.features) && service.features.length) {
    featuresPanel.style.display = 'block';
    featuresList.innerHTML = service.features.map(f => `
      <li class="product-feature-item">
        <span class="product-feature-check" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
        ${escapeHtml(f)}
      </li>
    `).join('');
  } else if (featuresPanel) {
    featuresPanel.style.display = 'none';
  }

  // Technologies
  const techTags = document.getElementById('product-tech-tags');
  const techPanel = document.getElementById('product-tech-panel');
  if (techTags && Array.isArray(service.technologies) && service.technologies.length) {
    techPanel.style.display = 'block';
    techTags.innerHTML = service.technologies.map(t =>
      `<span class="tech-tag">${escapeHtml(t)}</span>`
    ).join('');
  } else if (techPanel) {
    techPanel.style.display = 'none';
  }

  // Trigger scroll reveals
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  });

  // Pre-select service in contact form dropdown
  const serviceSelect = document.getElementById('contact-service');
  if (serviceSelect && service.title) {
    let matched = false;
    for (let opt of serviceSelect.options) {
      if (opt.value === service.slug || opt.textContent.trim().toLowerCase() === service.title.toLowerCase()) {
        opt.selected = true;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const customOpt = document.createElement('option');
      customOpt.value = service.id || service.title;
      customOpt.textContent = service.title;
      customOpt.selected = true;
      serviceSelect.insertBefore(customOpt, serviceSelect.options[1]);
    }
  }

  // Load reviews from Supabase
  loadReviews(service);
}

function renderError() {
  const loading = document.getElementById('product-loading');
  const content = document.getElementById('product-content');
  const err = document.getElementById('product-error');
  if (loading) loading.style.display = 'none';
  if (content) content.style.display = 'none';
  if (err) err.style.display = 'block';

  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  });
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function formatDate(isoStr) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function renderReviewsEmpty(container, message) {
  container.innerHTML = `
    <div class="reviews-empty">
      <div class="reviews-empty-icon" aria-hidden="true">💬</div>
      <p class="reviews-empty-text">${escapeHtml(message)}</p>
    </div>
  `;
}

// Fetch & Render Reviews from Supabase
async function loadReviews(service) {
  const reviewsList = document.getElementById('reviews-list');
  const aggregateEl = document.getElementById('reviews-aggregate');
  const subtitleEl = document.getElementById('reviews-subtitle');

  if (!reviewsList) return;

  try {
    let reviews = null;

    if (service.id) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('service_id', service.id)
        .order('created_at', { ascending: false });
      reviews = data;
    }

    if ((!reviews || reviews.length === 0) && service.slug) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('service_id', service.slug)
        .order('created_at', { ascending: false });
      if (data && data.length > 0) reviews = data;
    }

    if (!reviews || reviews.length === 0) {
      renderReviewsEmpty(reviewsList, 'No reviews yet for this service.');
      if (subtitleEl) subtitleEl.textContent = 'Be the first to review this service!';
      return;
    }

    const totalScore = reviews.reduce((acc, r) => acc + (Number(r.rating || r.stars) || 5), 0);
    const avgScore = (totalScore / reviews.length).toFixed(1);

    if (aggregateEl) {
      aggregateEl.innerHTML = `
        <div class="reviews-score-badge">
          <span class="reviews-score-num">${avgScore}</span>
          <div class="reviews-score-meta">
            <span class="reviews-score-stars">${buildStars(avgScore)}</span>
            <span class="reviews-score-count">${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
      `;
    }

    if (subtitleEl) {
      subtitleEl.textContent = `Based on ${reviews.length} verified client ${reviews.length === 1 ? 'review' : 'reviews'}`;
    }

    reviewsList.innerHTML = reviews.map((rev) => {
      const userName = escapeHtml(rev.user_name || rev.name || rev.reviewer_name || rev.user_email || 'Verified Client');
      const rating = Math.min(5, Math.max(1, Number(rev.rating || rev.stars || 5)));
      const comment = rev.comment || rev.review || rev.content || '';
      const createdDate = rev.created_at ? formatDate(rev.created_at) : '';
      const avatarUrl = rev.user_avatar || rev.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6c63ff&color=fff&size=64`;

      return `
        <article class="review-item">
          <div class="review-header">
            <div class="review-author">
              <img class="review-avatar" src="${escapeHtml(avatarUrl)}" alt="${userName}" loading="lazy" />
              <div>
                <h4 class="review-author-name">${userName}</h4>
                <div class="review-stars" aria-label="Rating: ${rating} out of 5">
                  ${buildStars(rating)}
                </div>
              </div>
            </div>
            ${createdDate ? `<time class="review-date" datetime="${escapeHtml(rev.created_at)}">${createdDate}</time>` : ''}
          </div>
          ${comment ? `<p class="review-comment">${escapeHtml(comment)}</p>` : ''}
        </article>
      `;
    }).join('');

  } catch (err) {
    console.warn('[BrachioTech Reviews] Error loading reviews:', err);
    renderReviewsEmpty(reviewsList, 'Reviews temporarily unavailable.');
  }
}

// Initializer: Supabase First, Fallback to JSON
async function init() {
  const serviceParam = getSlugFromUrl();

  if (!serviceParam) {
    window.location.href = 'index.html#services';
    return;
  }

  let service = null;
  let serviceImages = [];
  let serviceLinks = [];

  // 1. SUPABASE QUERY
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceParam);

    let query = supabase.from('services').select('*');
    if (isUuid) {
      query = query.eq('id', serviceParam);
    } else {
      query = query.ilike('title', `%${serviceParam.replace(/-/g, ' ')}%`);
    }

    const { data: supaServices } = await query.limit(1);

    if (supaServices && supaServices.length > 0) {
      service = supaServices[0];

      // Fetch related images and links
      const [imgRes, linkRes] = await Promise.all([
        supabase
          .from('service_images')
          .select('*')
          .eq('service_id', service.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('service_links')
          .select('*')
          .eq('service_id', service.id)
      ]);

      serviceImages = imgRes.data || [];
      serviceLinks = linkRes.data || [];
    }
  } catch (err) {
    console.warn('[BrachioTech] Supabase service lookup failed:', err);
  }

  // 2. FALLBACK TO JSON IF NOT IN SUPABASE
  if (!service) {
    try {
      const response = await fetch(SERVICES_URL, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        service = data.find(s => s.slug === serviceParam || s.id === serviceParam);
      }
    } catch (err) {
      console.warn('[BrachioTech] services.json fetch failed, using inline fallback:', err.message);
      service = SERVICES_FALLBACK.find(s => s.slug === serviceParam || s.id === serviceParam);
    }
  }

  if (!service) {
    renderError();
    return;
  }

  setTimeout(() => renderProduct(service, serviceImages, serviceLinks), 200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
