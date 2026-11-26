/* ==========================================================================
   GRACE AGENCY — Interactive Controls, Live Countdown & Motion
   ========================================================================== */

(() => {
  'use strict';

  // 1. Custom Cursor (Desktop)
  const ring = document.querySelector('.cursor-ring');
  const dot = document.querySelector('.cursor-dot');
  if (ring && dot && window.matchMedia('(hover: hover)').matches) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      ring.style.opacity = '1';
      dot.style.opacity = '1';
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    }, { passive: true });

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    document.querySelectorAll('a, button, .work-card, .faq-trigger').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }

  // 2. Smart Hide-on-Scroll Header
  const header = document.querySelector('.site-header');
  if (header) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 140 && y > lastY) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  // 3. Fullscreen Overlay Menu
  const menuOverlay = document.getElementById('overlayMenu');
  const menuOpeners = document.querySelectorAll('[data-menu-open]');
  const menuClosers = document.querySelectorAll('[data-menu-close]');

  const toggleMenu = (open) => {
    if (!menuOverlay) return;
    menuOverlay.classList.toggle('is-open', open);
    menuOverlay.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  menuOpeners.forEach((btn) => btn.addEventListener('click', () => toggleMenu(true)));
  menuClosers.forEach((btn) => btn.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  // 4. Persistent Live Countdown Timer (All [data-countdown] widgets)
  const COUNTDOWN_KEY = 'grace_agency_offer_deadline_v1';
  const WINDOW_MS = (6 * 24 * 60 * 60 + 14 * 60 * 60 + 38 * 60) * 1000; // 6d 14h 38m rolling cohort window

  function getDeadline() {
    try {
      const saved = Number(localStorage.getItem(COUNTDOWN_KEY));
      const now = Date.now();
      if (saved && saved > now + 60000) return saved;
      const next = now + WINDOW_MS;
      localStorage.setItem(COUNTDOWN_KEY, String(next));
      return next;
    } catch {
      return Date.now() + WINDOW_MS;
    }
  }

  const deadline = getDeadline();
  const countdownEls = document.querySelectorAll('[data-countdown]');

  function pad(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, '0');
  }

  function updateCountdowns() {
    const diff = Math.max(0, deadline - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    countdownEls.forEach((root) => {
      const d = root.querySelector('[data-cd="days"]');
      const h = root.querySelector('[data-cd="hours"]');
      const m = root.querySelector('[data-cd="minutes"]');
      const s = root.querySelector('[data-cd="seconds"]');
      if (d) d.textContent = pad(days);
      if (h) h.textContent = pad(hours);
      if (m) m.textContent = pad(mins);
      if (s) s.textContent = pad(secs);
    });
  }

  if (countdownEls.length) {
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
  }

  // 5. Hero Video Playback Control
  const heroVideo = document.getElementById('heroVideo');
  const videoToggleBtn = document.getElementById('videoToggleBtn');
  if (heroVideo && videoToggleBtn) {
    videoToggleBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
        videoToggleBtn.textContent = 'PAUSE REEL ❚❚';
      } else {
        heroVideo.pause();
        videoToggleBtn.textContent = 'PLAY REEL ▶';
      }
    });
  }

  // 6. Interactive Comparison Widget ("Other Agencies" vs "Grace Agency")
  const compareBtns = document.querySelectorAll('[data-compare-mode]');
  const compareList = document.getElementById('compareList');
  const compareBadge = document.getElementById('compareBadge');

  const compareData = {
    others: [
      '✕ Generic templates disconnected from email capture',
      '✕ Unsegmented blasts landing in spam folders',
      '✕ Slow turnaround with junior handoffs'
    ],
    grace: [
      '✓ Conversion-first web UX synced to Klaviyo & Beehiiv',
      '✓ Authenticated SPF/DKIM/DMARC + segmented lifecycle flows',
      '✓ Direct founder collaboration & 48h sprint checkpoints'
    ]
  };

  compareBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.compareMode;
      compareBtns.forEach((b) => {
        b.classList.remove('is-active-bad', 'is-active-good');
      });
      btn.classList.add(mode === 'others' ? 'is-active-bad' : 'is-active-good');
      if (compareList) {
        compareList.innerHTML = compareData[mode].map((item) => `<li>${item}</li>`).join('');
      }
      if (compareBadge) {
        compareBadge.textContent = mode === 'others' ? 'LEGACY APPROACH' : 'REVENUE-FIRST';
      }
    });
  });

  // 7. Portfolio Category Filter
  const filterTabs = document.querySelectorAll('[data-filter]');
  const workCards = document.querySelectorAll('.work-card[data-category]');
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.filter;
      filterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      workCards.forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        const show = cat === 'all' || categories.includes(cat);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  // 8. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    if (!trigger || !panel) return;

    if (item.classList.contains('is-open')) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      faqItems.forEach((other) => {
        other.classList.remove('is-open');
        const p = other.querySelector('.faq-panel');
        if (p) p.style.maxHeight = '0px';
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // 9. Contact Form Pill Selector & Direct Submission (Gmail + WhatsApp)
  const servicePills = document.querySelectorAll('.pill-select');
  servicePills.forEach((pill) => {
    pill.addEventListener('click', () => pill.classList.toggle('is-selected'));
  });

  const contactForm = document.getElementById('graceContactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('cfName')?.value || '').trim();
      const email = (document.getElementById('cfEmail')?.value || '').trim();
      const platform = (document.getElementById('cfPlatform')?.value || '').trim();
      const details = (document.getElementById('cfDetails')?.value || '').trim();
      const selected = Array.from(document.querySelectorAll('.pill-select.is-selected'))
        .map((el) => el.textContent.trim());

      const subject = encodeURIComponent(`Project Inquiry from ${name} — Grace Agency`);
      const bodyText = [
        `Name: ${name}`,
        `Client Email: ${email}`,
        `Primary Platform: ${platform || 'Not specified'}`,
        `Selected Services: ${selected.length ? selected.join(', ') : 'General Inquiry'}`,
        ``,
        `Project Brief:`,
        details
      ].join('\n');

      const mailtoUrl = `mailto:graceagency80@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
      const waUrl = `https://wa.me/2349133304451?text=${encodeURIComponent(`Hi Grace Agency, I'm ${name}.\n\n${bodyText}`)}`;

      if (formStatus) {
        formStatus.innerHTML = `
          <div style="padding:16px 18px;border-radius:12px;background:rgba(182,244,25,0.1);border:1px solid rgba(182,244,25,0.35);margin-top:16px;">
            <strong style="color:#b6f419;display:block;margin-bottom:6px;">Brief Ready — Choose Your Preferred Send Channel:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;">
              <a href="${mailtoUrl}" class="btn btn-primary btn-sm">Open in Gmail / Email ↗</a>
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Send via WhatsApp ↗</a>
            </div>
          </div>
        `;
      }
      window.location.href = mailtoUrl;
    });
  }

  // 10. Scroll Reveal Observer
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 80px 0px' });
    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
