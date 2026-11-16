/**
 * کنترلر تعاملات و چیدمان پرتال درس تجارت الکترونیکی دانشگاه یزد
 * ناوبری خطی کم‌حجم، چک‌لیست درختی زیرموردهای فازهای چهارگانه،
 * اتصال زمینه‌ای هر بخش به ابزارهای کمکی پروژه و جستجوی سریع (Ctrl+K یا /)
 */

document.addEventListener('DOMContentLoaded', () => {
  const CHECKLIST_KEY = 'yazd_ec_checklist_v5';
  const THEME_KEY = 'yazd_ec_theme_v4';

  /* ========================================================================
     ۱. خط ظریف پیشرفت مطالعه و ناوبری اسکرول‌اسپای
     ======================================================================== */
  const progressBar = document.getElementById('scroll-progress-bar');
  const updateProgress = () => {
    if (!progressBar) return;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
    progressBar.style.width = `${pct}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const chapterLinks = document.querySelectorAll('.nav-chapter-link[href^="#"]');
  if (chapterLinks.length && typeof IntersectionObserver !== 'undefined') {
    const map = new Map();
    chapterLinks.forEach((link) => {
      const sec = document.getElementById(link.getAttribute('href').slice(1));
      if (sec) map.set(sec, link);
    });

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const active = map.get(entry.target);
            if (!active) return;
            chapterLinks.forEach((l) => l.classList.remove('is-active'));
            active.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0.01 }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }

  // کشوی فهرست عمودی در موبایل و تبلت
  const vSidebar = document.getElementById('site-vertical-sidebar');
  const sBackdrop = document.getElementById('sidebar-backdrop');
  const openSidebarBtn = document.getElementById('open-mobile-sidebar');
  const closeSidebarBtn = document.getElementById('close-mobile-sidebar');

  function toggleMobileSidebar(open) {
    if (!vSidebar) return;
    vSidebar.classList.toggle('is-open', open);
    sBackdrop?.classList.toggle('is-open', open);
  }

  openSidebarBtn?.addEventListener('click', () => toggleMobileSidebar(true));
  closeSidebarBtn?.addEventListener('click', () => toggleMobileSidebar(false));
  sBackdrop?.addEventListener('click', () => toggleMobileSidebar(false));
  chapterLinks.forEach((link) => {
    link.addEventListener('click', () => toggleMobileSidebar(false));
  });

  /* ========================================================================
     ۲. مدیریت پالت‌های رنگی چهارگانه و صدای میکرو-تعامل
     ======================================================================== */
  const themeBtns = document.querySelectorAll('[data-set-theme]');
  const validThemes = ['paper', 'carbon', 'sepia', 'contrast'];
  let activeTheme = 'paper';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && validThemes.includes(saved)) activeTheme = saved;
  } catch {
    activeTheme = 'paper';
  }

  function applyTheme(theme) {
    const next = validThemes.includes(theme) ? theme : 'paper';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // نادیده گرفتن محدودیت فضا
    }
    themeBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-set-theme') === next);
    });
    window.portalThree?.refreshTheme?.();
    window.redrawIdeaRadar?.();
    window.redrawLiedtkaDiagram?.();
  }
  applyTheme(activeTheme);

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(btn.getAttribute('data-set-theme'));
      if (window.spatialAudio) window.spatialAudio.playClick(580, 0.035);
    });
  });

  const audioBtns = document.querySelectorAll('[data-audio-toggle], #audio-toggle-btn');
  const syncAudioIcon = (on) => {
    audioBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      const wave = btn.querySelector('[data-sound-wave]');
      const muteLine = btn.querySelector('[data-sound-mute]');
      if (wave) wave.classList.toggle('is-hidden', !on);
      if (muteLine) muteLine.classList.toggle('is-hidden', on);
    });
  };
  if (window.spatialAudio) syncAudioIcon(window.spatialAudio.enabled);
  audioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!window.spatialAudio) return;
      const state = window.spatialAudio.toggle();
      syncAudioIcon(state);
    });
  });

  /* ========================================================================
     ۳. کنترلر تندیس سه‌بعدی صفحه فرود (۴ ایستگاه بدون شلوغی متنی)
     ======================================================================== */
  const heroPills = document.querySelectorAll('[data-hero-stage]');
  const heroCardEl = document.getElementById('hero-journey-card');

  let currentHeroStage = 0;
  let heroHovered = false;

  function selectHeroStage(idx, fromUser = false) {
    currentHeroStage = ((Number(idx) % 4) + 4) % 4;

    heroPills.forEach((pill) => {
      pill.classList.toggle('is-active', Number(pill.getAttribute('data-hero-stage')) === currentHeroStage);
    });

    window.portalThree?.setHeroStage?.(currentHeroStage);
    if (fromUser && window.spatialAudio) {
      window.spatialAudio.playClick(600, 0.032);
    }
  }

  window.stepHeroJourney = () => {
    selectHeroStage(currentHeroStage + 1, true);
  };

  heroPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      selectHeroStage(Number(pill.getAttribute('data-hero-stage')), true);
    });
  });

  if (heroCardEl) {
    heroCardEl.addEventListener('pointerenter', () => { heroHovered = true; });
    heroCardEl.addEventListener('pointerleave', () => { heroHovered = false; });
    setInterval(() => {
      if (!heroHovered && !document.hidden) {
        selectHeroStage(currentHeroStage + 1, false);
      }
    }, 6400);
  }

  /* ========================================================================
     ۳-ب. بخش ۰۲: سنجشگر تعاملی تطابق تصمیم دانشجو با ضوابط عمومی
     ======================================================================== */
  const complianceData = {
    'stack-ok': {
      tone: 'allow',
      badge: 'مجاز و استاندارد ✓',
      text: 'استفاده از فریم‌ورک‌ها و کتابخانه‌های استاندارد وب (React, Vue, Next.js, Nuxt, Svelte, Angular یا HTML5/JS/TailwindCSS) با کدنویسی مستقیم دانشجو کاملاً آزاد و مورد تأکید است.',
      ref: 'منطبق بر بند سوم ضوابط ↑',
      ruleNum: '3'
    },
    'cms-ban': {
      tone: 'ban',
      badge: 'اکیداً ممنوع — فاقد ارزش فنی ✕',
      text: 'استفاده از وردپرس، ووکامرس، شاپایفای، وب‌فلو و هرگونه سیستم مدیریت محتوا یا فروشگاه‌ساز آماده بدون کد در رشته مهندسی کامپیوتر مردود است.',
      ref: 'خط قرمز بند سوم ضوابط ↑',
      ruleNum: '3'
    },
    'topic-same': {
      tone: 'allow',
      badge: 'کاملاً مجاز (با توسعه مستقل) ✓',
      text: 'نیازی به رزرو انحصاری موضوع نیست؛ فعالیت دو دانشجو در یک صنف مشترک مجاز است و اصالت تحلیل، تمایز ارزش پیشنهادی و کدنویسی مستقل ملاک نمره است.',
      ref: 'منطبق بر بند دوم ضوابط ↑',
      ruleNum: '2'
    },
    'db-local': {
      tone: 'allow',
      badge: 'مجاز (با اسکیمای مشخص) ✓',
      text: 'ذخیره‌سازی در LocalStorage یا Mock API کاملاً پذیرفته است؛ به شرط داشتن اسکیمای ساختاریافته و حفظ پایداری داده‌ها پس از رفرش مرورگر.',
      ref: 'منطبق بر بند چهارم ضوابط ↑',
      ruleNum: '4'
    },
    'db-cloud': {
      tone: 'bonus',
      badge: 'مجاز + امتیاز ویژه مهندسی ★',
      text: 'اتصال به پایگاه‌های داده ابری (Supabase, Firebase, PocketBase) یا دیتابیس‌های واقعی یک مزیت رقابتی برجسته در ارزیابی نهایی محسوب می‌شود.',
      ref: 'مزیت رقابتی بند چهارم ضوابط ↑',
      ruleNum: '4'
    },
    'pay-real': {
      tone: 'ban',
      badge: 'اکیداً ممنوع — فقط Sandbox ✕',
      text: 'اتصال به درگاه‌های بانکی واقعی یا دریافت اطلاعات هویتی و بانکی واقعی اشخاص ممنوع است؛ تمام تراکنش‌ها باید شبیه‌سازی‌شده (Sandbox / Mock) باشند.',
      ref: 'خط قرمز بند پنجم ضوابط ↑',
      ruleNum: '5'
    },
    'ai-use': {
      tone: 'warn',
      badge: 'مجاز مشروط به تسلط کامل فردی !',
      text: 'بهره‌گیری از هوش مصنوعی با ثبت صادقانه در AI_DISCLOSURE.md مجاز است، اما دانشجو مسئول تک‌تک خطوط کد بوده و باید در دفاع قادر به تغییر زنده کد باشد.',
      ref: 'منطبق بر بندهای اول و پنجم ضوابط ↑',
      ruleNum: '5'
    }
  };

  let activeRuleNum = '3';
  const ruleCheckChips = document.querySelectorAll('[data-rule-check]');
  const verdictBanner = document.getElementById('compliance-verdict-banner');
  const verdictBadge = document.getElementById('compliance-verdict-badge');
  const verdictText = document.getElementById('compliance-verdict-text');
  const verdictRef = document.getElementById('compliance-verdict-ref');
  const ruleCards = document.querySelectorAll('[data-rule-card]');

  function spotlightRuleCard(ruleNum, tone = 'allow') {
    activeRuleNum = String(ruleNum);
    ruleCards.forEach((card) => {
      card.classList.remove('is-spotlight', 'is-spotlight-danger', 'is-spotlight-warm');
      if (card.getAttribute('data-rule-card') === activeRuleNum) {
        const cls =
          tone === 'ban' ? 'is-spotlight-danger' : tone === 'bonus' || tone === 'warn' ? 'is-spotlight-warm' : 'is-spotlight';
        card.classList.add(cls);
      }
    });
  }

  verdictRef?.addEventListener('click', () => {
    const targetCard = document.querySelector(`[data-rule-card="${activeRuleNum}"]`);
    targetCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  ruleCheckChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-rule-check');
      const d = complianceData[key];
      if (!d) return;

      ruleCheckChips.forEach((c) => c.classList.toggle('is-active', c === chip));
      if (verdictBanner) verdictBanner.setAttribute('data-tone', d.tone);
      if (verdictBadge) {
        verdictBadge.textContent = d.badge;
        verdictBadge.style.background =
          d.tone === 'ban' ? 'var(--danger)' : d.tone === 'bonus' || d.tone === 'warn' ? 'var(--warm)' : 'var(--accent)';
        verdictBadge.style.color = d.tone === 'allow' ? 'var(--accent-contrast)' : '#ffffff';
      }
      if (verdictText) verdictText.textContent = d.text;
      if (verdictRef) {
        verdictRef.textContent = d.ref;
        verdictRef.style.color =
          d.tone === 'ban' ? 'var(--danger)' : d.tone === 'bonus' || d.tone === 'warn' ? 'var(--warm)' : 'var(--accent)';
      }

      spotlightRuleCard(d.ruleNum, d.tone);
      if (window.spatialAudio) window.spatialAudio.playClick(570, 0.032);
    });
  });

  ruleCards.forEach((card) => {
    card.addEventListener('click', () => {
      spotlightRuleCard(card.getAttribute('data-rule-card'), 'allow');
    });
  });

  /* ========================================================================
     ۳-ج. بخش ۰۳: نقشه راه تعاملی ۴ ایستگاهی تکوین ایده
     ======================================================================== */
  const roadmapBtns = document.querySelectorAll('[data-roadmap-step]');
  const roadmapPanels = document.querySelectorAll('[data-roadmap-panel]');
  const roadmapFill = document.getElementById('roadmap-track-fill');
  const roadmapPrev = document.getElementById('roadmap-prev-btn');
  const roadmapNext = document.getElementById('roadmap-next-btn');
  const roadmapIndicator = document.getElementById('roadmap-step-indicator');
  let activeRoadmapStep = 1;

  function setRoadmapStep(stepNum, playSound = false) {
    activeRoadmapStep = Math.max(1, Math.min(4, Number(stepNum) || 1));

    roadmapBtns.forEach((btn) => {
      const s = Number(btn.getAttribute('data-roadmap-step'));
      btn.classList.toggle('is-active', s === activeRoadmapStep);
      btn.classList.toggle('is-passed', s < activeRoadmapStep);
    });

    roadmapPanels.forEach((panel) => {
      panel.classList.toggle('is-active', Number(panel.getAttribute('data-roadmap-panel')) === activeRoadmapStep);
    });

    if (roadmapFill) {
      const pct = ((activeRoadmapStep - 1) / 3) * 100;
      roadmapFill.style.width = `${pct}%`;
    }
    if (roadmapIndicator) {
      roadmapIndicator.textContent = `گام ${activeRoadmapStep.toLocaleString('fa-IR')} از ۴ نقشه راه`;
    }
    if (roadmapPrev) roadmapPrev.disabled = activeRoadmapStep === 1;
    if (roadmapPrev) roadmapPrev.style.opacity = activeRoadmapStep === 1 ? '0.45' : '1';
    if (roadmapNext) {
      roadmapNext.textContent = activeRoadmapStep === 4 ? 'شروع مجدد از گام اول ↺' : 'گام بعدی ←';
    }
    if (playSound && window.spatialAudio) {
      window.spatialAudio.playClick(610, 0.032);
    }
  }

  roadmapBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      setRoadmapStep(Number(btn.getAttribute('data-roadmap-step')), true);
    });
  });

  roadmapPrev?.addEventListener('click', () => {
    if (activeRoadmapStep > 1) setRoadmapStep(activeRoadmapStep - 1, true);
  });

  roadmapNext?.addEventListener('click', () => {
    setRoadmapStep(activeRoadmapStep === 4 ? 1 : activeRoadmapStep + 1, true);
  });

  if (roadmapBtns.length) setRoadmapStep(1, false);

  /* ========================================================================
     ۴. بخش ۰۴: چیدمان پویای ۴ فاز (۴ کارت در یک ردیف ↔ ۱ فاز باز + ۳ فاز فشرده در سمت چپ)
     ======================================================================== */
  const phasesDeck = document.getElementById('phases-interactive-deck');
  const phaseResetRowBtn = document.getElementById('phases-reset-row-btn');
  const phasePanels = document.querySelectorAll('[data-phase-panel]');
  const phaseSiblings = document.querySelectorAll('[data-phase-sibling]');
  const phaseClosedCards = document.querySelectorAll('[data-vt-card]');

  function applyPhaseDeckDOM(targetPhase) {
    if (!phasesDeck) return;
    const val = targetPhase ? String(targetPhase) : 'none';
    phasesDeck.setAttribute('data-active-phase', val);
    phaseResetRowBtn?.classList.toggle('is-hidden', val === 'none');

    phasePanels.forEach((p) => {
      p.classList.toggle('is-open', p.getAttribute('data-phase-panel') === val);
    });
    phaseSiblings.forEach((sib) => {
      sib.classList.toggle('is-hidden', sib.getAttribute('data-phase-sibling') === val);
    });
  }

  function transitionPhaseDeck(targetPhase) {
    if (!phasesDeck) return;
    const current = phasesDeck.getAttribute('data-active-phase') || 'none';
    const next = targetPhase ? String(targetPhase) : 'none';
    if (current === next) return;

    const assignNames = (mode) => {
      [1, 2, 3, 4].forEach((n) => {
        const key = String(n);
        const closedEl = phasesDeck.querySelector(`[data-vt-card="${key}"]`);
        const panelEl = phasesDeck.querySelector(`[data-phase-panel="${key}"]`);
        const sibEl = phasesDeck.querySelector(`[data-phase-sibling="${key}"]`);
        if (closedEl) closedEl.style.viewTransitionName = '';
        if (panelEl) panelEl.style.viewTransitionName = '';
        if (sibEl) sibEl.style.viewTransitionName = '';

        if (mode === 'clear') return;
        const activeVal = mode === 'before' ? current : next;
        const vtName = `phase-morph-${key}`;
        if (activeVal === 'none') {
          if (closedEl) closedEl.style.viewTransitionName = vtName;
        } else if (activeVal === key) {
          if (panelEl) panelEl.style.viewTransitionName = vtName;
        } else {
          if (sibEl) sibEl.style.viewTransitionName = vtName;
        }
      });
    };

    const canVT =
      typeof document.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canVT) {
      assignNames('before');
      const vt = document.startViewTransition(() => {
        applyPhaseDeckDOM(next);
        assignNames('after');
      });
      vt.finished.finally(() => assignNames('clear'));
    } else {
      applyPhaseDeckDOM(next);
    }

    if (window.spatialAudio) {
      window.spatialAudio.playClick(next === 'none' ? 490 : 630, 0.035);
    }
  }

  document.querySelectorAll('[data-phase-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pNum = btn.getAttribute('data-phase-open');
      transitionPhaseDeck(pNum);
    });
  });

  document.querySelectorAll('[data-phase-close]').forEach((btn) => {
    btn.addEventListener('click', () => transitionPhaseDeck('none'));
  });

  phaseResetRowBtn?.addEventListener('click', () => transitionPhaseDeck('none'));

  document.querySelectorAll('[data-open-phase]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pNum = link.getAttribute('data-open-phase');
      toggleMobileSidebar(false);
      document.getElementById('sec-phases')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => transitionPhaseDeck(pNum), 160);
    });
  });

  const deliverableChks = document.querySelectorAll('.deliverable-chk[data-chk-id]');
  let savedChecks = {};
  try {
    savedChecks = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
  } catch {
    savedChecks = {};
  }

  function refreshChecklistCounts() {
    if (!deliverableChks.length) return;
    const perPhase = { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] };

    deliverableChks.forEach((chk) => {
      const p = chk.getAttribute('data-chk-phase');
      const row = chk.closest('.chk-item');
      if (row) row.classList.toggle('is-done', chk.checked);
      if (p && perPhase[p]) {
        perPhase[p][1]++;
        if (chk.checked) perPhase[p][0]++;
      }
    });

    // محاسبه وضعیت تکمیل زیرموردهای هر سرفصل اصلی (.req-group)
    document.querySelectorAll('.req-group').forEach((grp) => {
      const boxes = grp.querySelectorAll('.deliverable-chk');
      if (!boxes.length) return;
      let done = 0;
      boxes.forEach((b) => {
        if (b.checked) done++;
      });
      const allDone = done === boxes.length;
      grp.classList.toggle('is-complete', allDone);
      const countEl = grp.querySelector('.req-group-count');
      if (countEl) {
        countEl.textContent = `${done.toLocaleString('fa-IR')} از ${boxes.length.toLocaleString('fa-IR')} جزء`;
      }
    });

    Object.entries(perPhase).forEach(([p, [done, all]]) => {
      document.querySelectorAll(`[data-phase-progress="${p}"]`).forEach((el) => {
        el.textContent = `${done.toLocaleString('fa-IR')}/${all.toLocaleString('fa-IR')}`;
      });
      const pct = all > 0 ? Math.round((done / all) * 100) : 0;
      document.querySelectorAll(`[data-phase-bar="${p}"]`).forEach((bar) => {
        bar.style.width = `${pct}%`;
      });
    });
  }

  deliverableChks.forEach((chk) => {
    const id = chk.getAttribute('data-chk-id');
    chk.checked = Boolean(savedChecks[id]);
    chk.addEventListener('change', () => {
      savedChecks[id] = chk.checked;
      try {
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(savedChecks));
      } catch {
        // نادیده گرفتن خطا
      }
      refreshChecklistCounts();
      if (window.spatialAudio) window.spatialAudio.playClick(chk.checked ? 690 : 440, 0.03);
    });
  });
  refreshChecklistCounts();

  /* ========================================================================
     ۵. بخش ۸: کشوی تقویم گوگل
     ======================================================================== */
  const calToggleBtn = document.getElementById('toggle-calendar-embed');
  const calWrap = document.getElementById('calendar-embed-container');
  const calShield = document.getElementById('calendar-scroll-shield');

  calShield?.addEventListener('click', () => {
    calShield.classList.add('is-unlocked');
  });

  calToggleBtn?.addEventListener('click', () => {
    if (!calWrap) return;
    const isHidden = calWrap.classList.toggle('is-hidden');
    calToggleBtn.textContent = isHidden ? 'نمایش تقویم رزرو نوبت در همین صفحه' : 'بستن قاب تقویم';
  });

  /* ========================================================================
     ۷. اتصال مستقیم بخش‌های درسی به ابزار متناظر در صفحه مجزای ابزارهای کمکی
     ======================================================================== */
  function openStudioToolLink(tool, subTab) {
    if (window.activateStudioTool) {
      window.activateStudioTool(tool, { scroll: true, engSubTab: subTab || undefined });
      return;
    }
    const qs = new URLSearchParams();
    if (tool) qs.set('tool', tool);
    if (subTab) qs.set('sub', subTab);
    window.location.href = `workshops.html?${qs.toString()}`;
  }

  document.querySelectorAll('[data-launch-studio]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-launch-studio');
      const subTab = btn.getAttribute('data-eng-subtab');
      if (window.spatialAudio) window.spatialAudio.playClick(640, 0.04);
      openStudioToolLink(tool, subTab);
    });
  });

  /* ========================================================================
     ۸. جستجوی سریع سرفصل‌ها و ابزارهای کمکی (Ctrl+K یا /)
     ======================================================================== */
  const cmdModal = document.getElementById('cmd-palette-modal');
  const cmdOpenBtn = document.getElementById('open-cmd-palette');
  const cmdCloseBtn = document.getElementById('close-cmd-palette');
  const cmdInput = document.getElementById('cmd-search-input');
  const cmdResults = document.getElementById('cmd-results-list');

  const searchItems = [
    { title: 'صفحه فرود — معرفی پروژه و تندیس سه‌بعدی چهار فاز', cat: 'صفحه فرود', target: 'hero-stage', kw: 'فرود معرفی پروژه سه بعدی' },
    { title: 'بخش ۰۱ — کلیات و ساختار خروجی پروژه (پرونده + MVP)', cat: 'مستندات', target: 'sec-overview', kw: 'پرونده تحلیلی mvp ساختار نهایی' },
    { title: 'بخش ۰۲ — ضوابط عمومی، سنجشگر تطابق پشته فناوری و ممنوعیت CMS', cat: 'ضوابط', target: 'sec-rules', kw: 'وردپرس ووکامرس درگاه پرداخت localstorage supabase اخلاق' },
    { title: 'بخش ۰۳ — نقشه راه مسئله‌یابی، ۴ لنز واگرا و ۸ پرسش ایده بالغ', cat: 'نقشه راه', target: 'sec-ideation', kw: 'نقشه راه تفکر واگرا همگرا لنز ایده بالغ لیدکا' },
    { title: 'بخش ۰۴ — شرح تفصیلی فازهای چهارگانه پروژه (به همراه زیرموردها)', cat: 'فازهای ترم', target: 'sec-phases', kw: 'فاز اول دوم سوم چهارم چک لیست تحویل' },
    { title: 'بخش ۰۵ — ماتریس خلاصه الزامات پروژه به تفکیک فازها', cat: 'جدول مرجع', target: 'sec-matrix', kw: 'ماتریس مقایسه جدول خلاصه فازها' },
    { title: 'بخش ۰۶ — استاندارد شناسنامه سناریوها و ویژگی‌های سطحی مردود', cat: 'استاندارد فنی', target: 'sec-scenarios', kw: 'حالت تیره اسکلتون فرم ایستا سناریو' },
    { title: 'بخش ۰۷ — استانداردهای مهندسی نرم‌افزار، README.md و AI_DISCLOSURE.md', cat: 'مهندسی نرم‌افزار', target: 'sec-engineering', kw: 'گیت ci cd docs srs adr readme' },
    { title: 'بخش ۰۸ — رزرو نوبت Google Calendar، فریز ۴ ساعته و جریمه مایلستون', cat: 'تحویل پروژه', target: 'sec-delivery', kw: 'تقویم گوگل فریز ۴ ساعته کسر ۰.۵ نمره آزمایشگاه' },
    { title: 'بخش ۰۹ — نظام ارزیابی و روبریک نمره‌دهی (۶ قطعی + ۱ تشویقی)', cat: 'ارزیابی', target: 'sec-rubric', kw: 'روبریک بارم نمره تشویقی' },
    { title: 'ابزار ۰۱ — مدل تفکر طراحی جین لیدکا (۴ پرسش و ۱۰ ابزار از مسئله تا ایده)', cat: 'ابزارهای کمکی پروژه', studio: 'liedtka', kw: 'جین لیدکا تفکر طراحی what is what if what wows what works طوفان فکری نقشه سفر' },
    { title: 'ابزار ۰۲ — رادار هندسی ۸ معیار ایده بالغ و شواهد تجربی', cat: 'ابزارهای کمکی پروژه', studio: 'radar', kw: 'رادار ۸ سوال شواهد ایده بالغ' },
    { title: 'ابزار ۰۳ — بوم مدل کسب‌وکار ۹ بخشی اوستروالدر (BMC)', cat: 'ابزارهای کمکی پروژه', studio: 'bmc', kw: 'بوم مدل کسب و کار bmc درآمد' },
    { title: 'ابزار ۰۴ — شبیه‌ساز سه‌بعدی قیف فروش AIDA و اقتصاد واحد (CAC)', cat: 'ابزارهای کمکی پروژه', studio: 'funnel', kw: 'قیف فروش aida cac ریزش' },
    { title: 'ابزار ۰۵ — شناسنامه سناریوهای MVP و مولد README / AI_DISCLOSURE', cat: 'ابزارهای کمکی پروژه', studio: 'bdd', kw: 'سناریو given when then readme ai_disclosure' },
    { title: 'ابزار ۰۶ — محاسبه‌گر نمره ۶+۱، زمان‌سنج فریز ۴ ساعته و کنترل نهایی', cat: 'ابزارهای کمکی پروژه', studio: 'rubric', kw: 'ماشین حساب نمره فریز کد' }
  ];

  let activeIdx = 0;

  function navigateFromSearch(item) {
    closeCmd();
    if (item.studio) {
      openStudioToolLink(item.studio);
      return;
    }
    if (item.target) {
      const el = document.getElementById(item.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('flash-focus');
        void el.offsetWidth;
        el.classList.add('flash-focus');
      }
    }
  }

  function renderCmdList(query = '') {
    if (!cmdResults) return;
    const q = query.trim().toLowerCase();
    const list = searchItems.filter(
      (it) => !q || it.title.toLowerCase().includes(q) || it.cat.toLowerCase().includes(q) || it.kw.toLowerCase().includes(q)
    );

    if (activeIdx >= list.length) activeIdx = 0;

    if (!list.length) {
      cmdResults.innerHTML = `<div class="p-6 text-center type-caption">موردی مطابق عبارت جستجوشده یافت نشد.</div>`;
      return;
    }

    cmdResults.innerHTML = list
      .map(
        (it, idx) => `
        <button type="button" data-cmd-idx="${idx}" class="w-full text-right px-3.5 py-2.5 rounded-md flex items-center justify-between gap-3 transition ${
          idx === activeIdx ? 'surface-well font-semibold' : 'hover:bg-black/5 font-normal'
        }">
          <span class="text-xs md:text-sm">${it.title}</span>
          <span class="type-kicker shrink-0">${it.cat}</span>
        </button>
      `
      )
      .join('');

    cmdResults.querySelectorAll('[data-cmd-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosen = list[Number(btn.getAttribute('data-cmd-idx'))];
        if (chosen) navigateFromSearch(chosen);
      });
    });

    cmdResults._currentFiltered = list;
  }

  function openCmd() {
    if (!cmdModal) return;
    cmdModal.classList.remove('is-hidden');
    activeIdx = 0;
    renderCmdList('');
    setTimeout(() => cmdInput?.focus(), 30);
  }

  function closeCmd() {
    if (!cmdModal) return;
    cmdModal.classList.add('is-hidden');
    if (cmdInput) cmdInput.value = '';
  }

  cmdOpenBtn?.addEventListener('click', openCmd);
  document.querySelectorAll('[data-open-cmd]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleMobileSidebar(false);
      openCmd();
    });
  });
  cmdCloseBtn?.addEventListener('click', closeCmd);
  cmdModal?.addEventListener('click', (e) => {
    if (e.target === cmdModal) closeCmd();
  });
  cmdInput?.addEventListener('input', () => {
    activeIdx = 0;
    renderCmdList(cmdInput.value);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal?.classList.contains('is-hidden')) openCmd();
      else closeCmd();
    } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      openCmd();
    } else if (e.key === 'Escape' && cmdModal && !cmdModal.classList.contains('is-hidden')) {
      closeCmd();
    } else if (cmdModal && !cmdModal.classList.contains('is-hidden')) {
      const list = cmdResults?._currentFiltered || [];
      if (!list.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % list.length;
        renderCmdList(cmdInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + list.length) % list.length;
        renderCmdList(cmdInput.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (list[activeIdx]) navigateFromSearch(list[activeIdx]);
      }
    }
  });
});
