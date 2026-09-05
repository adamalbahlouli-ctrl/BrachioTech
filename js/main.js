/**
 * BrachioTech — Main Application Script
 * Navigation, settings panel, scroll reveal, multi-step contact form, toast notifications
 */

(function () {
  'use strict';

  // ============================================================
  // UTILITIES
  // ============================================================
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function showToast(message, type, duration) {
    type = type || 'success';
    duration = duration || 4000;
    var container = document.getElementById('toast-container');
    if (!container) return;

    var icon = type === 'success' ? '✅' : '❌';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span>' + icon + '</span> <span>' + message + '</span>';
    toast.setAttribute('role', 'alert');
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);
  }

  // ============================================================
  // NAVBAR
  // ============================================================
  function initNavbar() {
    var navbar    = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var drawer    = document.getElementById('nav-drawer');

    if (!navbar) return;

    // Smart scroll effect: hide on scroll down, reveal immediately on scroll up
    var lastScrollY = window.scrollY;
    var ticking = false;
    var scrollThreshold = 8;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var currentScrollY = window.scrollY;
          navbar.classList.toggle('scrolled', currentScrollY > 20);

          if (currentScrollY > 90 && currentScrollY - lastScrollY > scrollThreshold) {
            navbar.classList.add('navbar-hidden');
          } else if (lastScrollY - currentScrollY > scrollThreshold || currentScrollY <= 90) {
            navbar.classList.remove('navbar-hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Hamburger toggle
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        var isOpen = drawer.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      // Close drawer when a link is clicked
      $$('.nav-link', drawer).forEach(function (link) {
        link.addEventListener('click', function () {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!navbar.contains(e.target) && !drawer.contains(e.target)) {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Active nav link on scroll
    var sections = $$('section[id]');
    var navLinks = $$('.nav-link[href^="#"]');

    function updateActiveLink() {
      var scrollY = window.scrollY + 120;
      var active = '';
      sections.forEach(function (section) {
        if (scrollY >= section.offsetTop) {
          active = '#' + section.id;
        }
      });
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === active);
      });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // ============================================================
  // SETTINGS PANEL
  // ============================================================
  function initSettings() {
    var overlay  = document.getElementById('settings-overlay');
    var panel    = document.getElementById('settings-panel');
    var closeBtn = document.getElementById('settings-close');

    var triggers = [
      document.getElementById('settings-trigger'),
      document.getElementById('drawer-settings')
    ].filter(Boolean);

    if (!overlay || !panel) return;

    function openSettings() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeSettings() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openSettings();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closeSettings();
      }
    });

    // Trap focus inside panel
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusable = $$('button, a, input, select, textarea', panel)
        .filter(function (el) { return !el.disabled; });
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  function initScrollReveal() {
    var elements = $$('.reveal');
    if (elements.length === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px 0px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });

    setTimeout(function () {
      elements.forEach(function (el) { el.classList.add('visible'); });
    }, 1500);
  }

  // ============================================================
  // EMAILJS INIT
  // ============================================================
  var EMAILJS_PUBLIC_KEY  = 'LQnmFTXdf1e3jfTU0';
  var EMAILJS_SERVICE_ID  = 'service_AdamNoxtary20085';
  var EMAILJS_TEMPLATE_ID = 'template_79xyy3w';

  function initEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.warn('[NeuralWorks] EmailJS library not loaded.');
      return;
    }
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ============================================================
  // MULTI-STEP CONTACT FORM
  // ============================================================
  function initContactForm() {
    var form            = document.getElementById('contact-form');
    var progressBar     = document.getElementById('form-progress-bar');
    var stepIndicator   = document.getElementById('form-step-indicator');
    var successState    = document.getElementById('form-success-state');
    var errorBox        = document.getElementById('form-error');
    var submitBtn       = document.getElementById('contact-submit');

    if (!form) return;

    var currentStep = 1;
    var totalSteps  = 4;

    // Track user selections
    var selections = {
      projectType: '',
      budget: ''
    };

    // ---- Progress update ----
    function updateProgress(step) {
      var pct = Math.round((step / totalSteps) * 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (stepIndicator) stepIndicator.textContent = 'Step ' + step + ' of ' + totalSteps;
    }

    // ---- Show/hide steps ----
    function goToStep(n) {
      var current = form.querySelector('.form-step.active');
      var next    = form.querySelector('#step-' + n + '-form');
      if (!next) return;

      if (current) {
        current.classList.remove('active');
      }

      // Force browser reflow so animation re-triggers on each step
      next.style.animation = 'none';
      next.offsetHeight; // trigger reflow
      next.style.animation = '';

      next.classList.add('active');
      currentStep = n;
      updateProgress(n);

      // If going to step 4, render summary
      if (n === 4) renderSummary();
    }

    // ---- Step 1 validation ----
    function validateStep1() {
      var name  = form.elements['name']  ? form.elements['name'].value.trim()  : '';
      var email = form.elements['email'] ? form.elements['email'].value.trim() : '';

      var nameInput  = document.getElementById('contact-name');
      var emailInput = document.getElementById('contact-email');

      var valid = true;

      if (!name) {
        if (nameInput) nameInput.classList.add('error');
        valid = false;
      } else {
        if (nameInput) nameInput.classList.remove('error');
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (emailInput) emailInput.classList.add('error');
        valid = false;
      } else {
        if (emailInput) emailInput.classList.remove('error');
      }

      if (!valid) {
        showToast('Please fill in your name and a valid email address.', 'error');
      }

      return valid;
    }

    // ---- Step 2 validation ----
    function validateStep2() {
      var type   = document.getElementById('project-type')  ? document.getElementById('project-type').value  : '';
      var budget = document.getElementById('budget')         ? document.getElementById('budget').value         : '';

      if (!type || !budget) {
        showToast('Please select a project type and a budget range.', 'error');
        return false;
      }
      return true;
    }

    // ---- Step 4 validation ----
    function validateStep4() {
      var message = form.elements['message'] ? form.elements['message'].value.trim() : '';
      var msgInput = document.getElementById('contact-message');

      if (!message) {
        if (msgInput) msgInput.classList.add('error');
        showToast('Please describe your project.', 'error');
        return false;
      }
      if (msgInput) msgInput.classList.remove('error');
      return true;
    }

    // ---- Option button groups ----
    function initOptionGroup(gridId, hiddenId) {
      var grid   = document.getElementById(gridId);
      var hidden = document.getElementById(hiddenId);
      if (!grid || !hidden) return;

      $$('.option-btn', grid).forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('.option-btn', grid).forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          hidden.value = btn.getAttribute('data-value') || btn.textContent.trim();
          if (hiddenId === 'project-type') selections.projectType = hidden.value;
          if (hiddenId === 'budget')       selections.budget       = hidden.value;
        });
      });
    }

    initOptionGroup('project-type-grid', 'project-type');
    initOptionGroup('budget-grid', 'budget');

    // ---- Checkbox: add/remove .checked class for CSS fallback ----
    $$('.checkbox-option', form).forEach(function (label) {
      var checkbox = label.querySelector('input[type="checkbox"]');
      if (!checkbox) return;
      checkbox.addEventListener('change', function () {
        label.classList.toggle('checked', checkbox.checked);
      });
    });

    // ---- Render summary on step 4 ----
    function renderSummary() {
      var summaryEl = document.getElementById('form-summary');
      if (!summaryEl) return;

      var name    = form.elements['name']    ? form.elements['name'].value.trim()    : '—';
      var type    = document.getElementById('project-type') ? document.getElementById('project-type').value || '—' : '—';
      var budget  = document.getElementById('budget')       ? document.getElementById('budget').value       || '—' : '—';

      // Collect checked assets
      var assets = [];
      $$('input[name="assets"]:checked', form).forEach(function (cb) {
        assets.push(cb.value);
      });
      var assetStr = assets.length > 0 ? assets.join(', ') : 'None selected';

      summaryEl.innerHTML =
        '<div class="summary-item"><span class="summary-label">Name:</span><span class="summary-value">' + escapeHtml(name) + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Project type:</span><span class="summary-value">' + escapeHtml(type) + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Budget:</span><span class="summary-value">' + escapeHtml(budget) + '</span></div>' +
        '<div class="summary-item"><span class="summary-label">Already have:</span><span class="summary-value">' + escapeHtml(assetStr) + '</span></div>';
    }

    // ---- HTML escape helper ----
    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // ---- Next/Prev button wiring ----
    $$('.form-next', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = parseInt(btn.getAttribute('data-next'), 10);
        if (!next) return;

        // Validate current step before proceeding
        var ok = true;
        if (currentStep === 1) ok = validateStep1();
        if (currentStep === 2) ok = validateStep2();

        if (ok) goToStep(next);
      });
    });

    $$('.form-prev', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var prev = parseInt(btn.getAttribute('data-prev'), 10);
        if (!prev) return;
        goToStep(prev);
      });
    });

    // ---- Real-time clear error on input ----
    $$('.form-input, .form-textarea', form).forEach(function (el) {
      el.addEventListener('input', function () {
        el.classList.remove('error');
      });
    });

    // ---- Form submit ----
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateStep4()) return;

      // Collect all data
      var name    = form.elements['name']    ? form.elements['name'].value.trim()    : '';
      var email   = form.elements['email']   ? form.elements['email'].value.trim()   : '';
      var type    = document.getElementById('project-type') ? document.getElementById('project-type').value : '';
      var budget  = document.getElementById('budget')       ? document.getElementById('budget').value       : '';
      var message = form.elements['message'] ? form.elements['message'].value.trim() : '';

      var assets = [];
      $$('input[name="assets"]:checked', form).forEach(function (cb) {
        assets.push(cb.value);
      });

      // Build formatted message body
      var formattedMessage =
        '=== PROJECT REQUEST ===\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        '--- Project Details ---\n' +
        'Project Type: ' + (type || 'Not specified') + '\n' +
        'Budget Range: ' + (budget || 'Not specified') + '\n' +
        'Already Have: ' + (assets.length > 0 ? assets.join(', ') : 'Nothing selected') + '\n\n' +
        '--- Project Description ---\n' +
        message;

      // Disable submit
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      if (errorBox) errorBox.hidden = true;

      // EmailJS not loaded
      if (typeof emailjs === 'undefined') {
        restoreSubmitBtn();
        showFormError();
        showToast('Email service unavailable. Please contact us directly.', 'error');
        return;
      }

      var templateParams = {
        name:    name,
        email:   email,
        service: type || 'Not specified',
        message: formattedMessage
      };

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function (result) {
          console.log('[NeuralWorks] Email sent:', result);
          showFormSuccess();
          showToast('Project request sent! We\'ll get back to you within 24 hours.', 'success', 6000);
          form.reset();
          resetFormState();
        })
        .catch(function (err) {
          console.error('[NeuralWorks] Email failed:', err);
          restoreSubmitBtn();
          showFormError();
          showToast('Failed to send. Please try again or contact us directly.', 'error');
        });
    });

    function resetFormState() {
      // Clear option selections
      $$('.option-btn', form).forEach(function (b) { b.classList.remove('selected'); });
      var ptInput = document.getElementById('project-type');
      var bgInput = document.getElementById('budget');
      if (ptInput) ptInput.value = '';
      if (bgInput) bgInput.value = '';
      selections.projectType = '';
      selections.budget = '';
    }

    function restoreSubmitBtn() {
      if (!submitBtn) return;
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    }

    function showFormSuccess() {
      // Hide the form steps content
      $$('.form-step', form).forEach(function (s) { s.style.display = 'none'; });
      var progress = form.querySelector('.form-progress');
      var indicator = form.querySelector('.form-step-indicator');
      if (progress) progress.style.display = 'none';
      if (indicator) indicator.style.display = 'none';

      if (successState) successState.hidden = false;
    }

    function showFormError() {
      if (errorBox) errorBox.hidden = false;
    }

    // Init progress
    updateProgress(1);
  }

  // ============================================================
  // SMOOTH SCROLL
  // ============================================================
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href   = anchor.getAttribute('href');
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
            10
          ) || 72;
          var top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // LAZY IMAGES
  // ============================================================
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;

    var images = $$('img[loading="lazy"]');
    if (typeof IntersectionObserver === 'undefined') return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.style.opacity = '1';
          observer.unobserve(img);
        }
      });
    });

    images.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      img.addEventListener('load', function () { img.style.opacity = '1'; });
      observer.observe(img);
    });
  }

  // ============================================================
  // PACKAGE BUTTON PRE-FILL
  // ============================================================
  function initPackageButtons() {
    var packageMap = {
      'pkg-launch-btn':       'Landing Page',
      'pkg-business-btn':     'Business Website',
      'pkg-professional-btn': 'Business Website',
      'pkg-custom-btn':       'Web Application'
    };

    var budgetMap = {
      'pkg-launch-btn':       '$50–$100',
      'pkg-business-btn':     '$100–$200',
      'pkg-professional-btn': '$200–$500',
      'pkg-custom-btn':       '$500+'
    };

    Object.keys(packageMap).forEach(function (btnId) {
      var btn = document.getElementById(btnId);
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        // Pre-select the matching options after the form is in view
        setTimeout(function () {
          var typeVal   = packageMap[btnId];
          var budgetVal = budgetMap[btnId];

          // Select project type option
          $$('#project-type-grid .option-btn').forEach(function (ob) {
            var match = ob.getAttribute('data-value') === typeVal;
            ob.classList.toggle('selected', match);
          });
          var ptInput = document.getElementById('project-type');
          if (ptInput) ptInput.value = typeVal;

          // Select budget option
          $$('#budget-grid .option-btn').forEach(function (ob) {
            var match = ob.getAttribute('data-value') === budgetVal;
            ob.classList.toggle('selected', match);
          });
          var bgInput = document.getElementById('budget');
          if (bgInput) bgInput.value = budgetVal;
        }, 600);
      });
    });
  }

  // ============================================================
  // ============================================================
  // INTRO WELCOME MODAL (10% PROBABILITY POPUP ON HOME)
  // ============================================================
  function initIntroModal() {
    var modalOverlay = document.getElementById('intro-modal-overlay');
    var closeBtn     = document.getElementById('intro-modal-close');
    var startedBtn   = document.getElementById('intro-modal-started-btn');
    if (!modalOverlay) return;

    function getStorageKey() {
      var user = window.currentAuthUser;
      if (user && user.id) {
        return 'bt_intro_seen_' + user.id;
      }
      return 'bt_intro_seen_guest';
    }

    function closeModal() {
      modalOverlay.classList.remove('show');
      modalOverlay.setAttribute('aria-hidden', 'true');
      try {
        localStorage.setItem(getStorageKey(), 'true');
        localStorage.setItem('bt_intro_seen', 'true');
      } catch (e) {}
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    if (startedBtn) {
      startedBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
        closeModal();
      }
    });

    // Exactly 10% probability for the popup to appear on an eligible Home-page visit
    // (90% of visits -> popup does NOT appear; 10% of visits -> popup appears)
    if (Math.random() < 0.10) {
      setTimeout(function () {
        modalOverlay.classList.add('show');
        modalOverlay.setAttribute('aria-hidden', 'false');
      }, 500);
    }
  }

  // ============================================================
  // MAIN INIT
  // ============================================================
  function init() {
    var modules = [
      { name: 'EmailJS',        fn: initEmailJS },
      { name: 'Navbar',         fn: initNavbar },
      { name: 'Settings',       fn: initSettings },
      { name: 'ScrollReveal',   fn: initScrollReveal },
      { name: 'ContactForm',    fn: initContactForm },
      { name: 'SmoothScroll',   fn: initSmoothScroll },
      { name: 'LazyImages',     fn: initLazyImages },
      { name: 'PackageButtons', fn: initPackageButtons },
      { name: 'IntroModal',     fn: initIntroModal }
    ];

    modules.forEach(function (mod) {
      try {
        mod.fn();
      } catch (err) {
        console.error('[NeuralWorks] Error initializing ' + mod.name + ':', err);
      }
    });

    window.addEventListener('unhandledrejection', function (event) {
      console.warn('[NeuralWorks] Unhandled rejection:', event.reason);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose utilities
  window.NW = { showToast: showToast };
})();
