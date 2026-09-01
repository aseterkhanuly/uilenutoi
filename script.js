(() => {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG — replace with your own Google Apps Script Web App URL
     that accepts POST { guestNames, attendance, guestCount, timestamp }
     and appends a row to a Google Sheet.
  ---------------------------------------------------------- */
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec';

  /* ----------------------------------------------------------
     SCROLL REVEAL
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const screenEls = document.querySelectorAll('.screen');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    const screenObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    screenEls.forEach(el => screenObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
    screenEls.forEach(el => el.classList.add('in-view'));
  }

  /* ----------------------------------------------------------
     GENTLE PARALLAX ON DECORATIVE BRANCHES
  ---------------------------------------------------------- */
  let ticking = false;
  const decos = document.querySelectorAll('.deco');

  function updateParallax() {
    const y = window.scrollY;
    decos.forEach((el, i) => {
      const speed = (i % 2 === 0) ? 0.04 : -0.03;
      el.style.transform = `translateY(${y * speed}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ----------------------------------------------------------
     SCROLL DOWN BUTTON
  ---------------------------------------------------------- */
  const scrollBtn = document.getElementById('scrollDown');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const sections = Array.from(document.querySelectorAll('.screen'));
      const current = sections.find(s => s.getBoundingClientRect().bottom > window.innerHeight * 0.6);
      const idx = sections.indexOf(current);
      const next = sections[idx + 1] || sections[sections.length - 1];
      next.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     MUSIC TOGGLE
  ---------------------------------------------------------- */
  const audio = document.getElementById('bgAudio');
  const musicBtn = document.getElementById('musicToggle');
  let hasStarted = false;

  if (musicBtn && audio) {
    musicBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => { /* file missing or blocked — ignore */ });
        musicBtn.classList.add('is-playing');
        musicBtn.setAttribute('aria-pressed', 'true');
        hasStarted = true;
      } else {
        audio.pause();
        musicBtn.classList.remove('is-playing');
        musicBtn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     CALENDAR — October 2026, wedding day 28
  ---------------------------------------------------------- */
  function buildCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const year = 2026;
    const monthIndex = 9; // October (0-based)
    const weddingDay = 28;

    const firstOfMonth = new Date(year, monthIndex, 1);
    // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first index (0=Mon..6=Sun)
    const jsDay = firstOfMonth.getDay();
    const mondayFirstIndex = (jsDay + 6) % 7;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const cells = [];

    // leading days from previous month
    for (let i = mondayFirstIndex - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, muted: true });
    }
    // days of this month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, muted: false, wedding: d === weddingDay });
    }
    // trailing days to complete the last week
    let trail = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: trail++, muted: true });
    }

    const frag = document.createDocumentFragment();
    cells.forEach(cell => {
      const div = document.createElement('div');
      div.className = 'calendar__day' + (cell.muted ? ' calendar__day--muted' : '') + (cell.wedding ? ' calendar__day--wedding' : '');

      if (cell.wedding) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heart.setAttribute('class', 'calendar__heart');
        heart.setAttribute('viewBox', '0 0 34 34');
        heart.innerHTML = '<path d="M17 27 C 6 19, 3 13, 7 9 C 10 6, 15 7, 17 12 C 19 7, 24 6, 27 9 C 31 13, 28 19, 17 27 Z" fill="none" stroke="var(--gold-soft)" stroke-width="1.3"/>';
        div.appendChild(heart);
      }

      const span = document.createElement('span');
      span.textContent = cell.day;
      div.appendChild(span);

      frag.appendChild(div);
    });

    grid.appendChild(frag);
  }

  buildCalendar();

  /* ----------------------------------------------------------
     RSVP — GUEST COUNTER
  ---------------------------------------------------------- */
  const countValueEl = document.getElementById('countValue');
  const guestCountInput = document.getElementById('guestCount');
  const minusBtn = document.getElementById('countMinus');
  const plusBtn = document.getElementById('countPlus');
  let guestCount = 1;
  const MAX_GUESTS = 10;

  function renderCount() {
    countValueEl.textContent = String(guestCount);
    guestCountInput.value = String(guestCount);
  }

  if (minusBtn && plusBtn) {
    minusBtn.addEventListener('click', () => {
      guestCount = Math.max(1, guestCount - 1);
      renderCount();
    });
    plusBtn.addEventListener('click', () => {
      guestCount = Math.min(MAX_GUESTS, guestCount + 1);
      renderCount();
    });
  }

  /* ----------------------------------------------------------
     RSVP — FORM SUBMIT
  ---------------------------------------------------------- */
  const form = document.getElementById('rsvpForm');
  const statusEl = document.getElementById('rsvpStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const namesInput = document.getElementById('guestNames');
      const names = namesInput.value.trim();

      if (!names) {
        statusEl.textContent = 'Есіміңізді жазыңызшы.';
        namesInput.focus();
        return;
      }

      const attendance = form.querySelector('input[name="attendance"]:checked')?.value || '';

      const payload = {
        guestNames: names,
        attendance,
        guestCount,
        timestamp: new Date().toISOString()
      };

      submitBtn.disabled = true;
      statusEl.textContent = 'Жіберілуде…';

      try {
        // no-cors: Apps Script web apps commonly don't return CORS headers;
        // we optimistically treat the request as sent.
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // local fallback copy, in case the endpoint above isn't configured yet
        try {
          const key = 'rsvp_responses';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.push(payload);
          localStorage.setItem(key, JSON.stringify(existing));
        } catch (_) { /* storage unavailable — ignore */ }

        statusEl.textContent = 'Рахмет! Жауабыңыз қабылданды.';
        form.reset();
        guestCount = 1;
        renderCount();
      } catch (err) {
        statusEl.textContent = 'Жіберу мүмкін болмады. Қайталап көріңізші.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
