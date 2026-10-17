/**
 * منطق کارگاه‌های تعاملی شش‌گانه پرتال تجارت الکترونیکی دانشگاه یزد
 * ۱. کارگاه تفکر واگرا، طوفان فکری، تعریف مسئله و هرس راهکارها (جدید)
 * ۲. رادار هندسی ۸ بعدی ارزیابی ایده بالغ
 * ۳. بوم مدل کسب‌وکار ۹ بخشی (BMC) با ۹ ری‌اکشن اختصاصی و متمایز برای هر بخش
 * ۴. کنترلر شبیه‌ساز سه‌بعدی قیف بازاریابی AIDA (متصل به جریان عمودی و هندسه پویا)
 * ۵. استودیوی تدوین شناسنامه سناریو (Given-When-Then) + تشخیص ضدالگو
 * ۶. ماشین‌حساب هوشمند ارزیابی روبریک، کسر نمره مایلستون و فریز ۴ ساعته کد
 */

document.addEventListener('DOMContentLoaded', () => {
  initDivergentThinkingWorkshop();
  initIdeaRadarWorkshop();
  initBMCWorkshop();
  initAidaFunnelWorkshop();
  initBDDScenarioStudio();
  initRubricCalculatorWorkshop();
});

/* ==========================================================================
   ۱. کارگاه تعاملی تفکر واگرا، طوفان فکری و هرس راهکارها (Divergent Thinking Studio)
   ========================================================================== */
function initDivergentThinkingWorkshop() {
  const stageWrapper = document.getElementById('mindmap-stage-wrapper');
  const svgLayer = document.getElementById('mindmap-connections-svg');
  const probNode = document.getElementById('mm-node-problem');
  const valNode = document.getElementById('mm-node-value');
  const ideasCol = document.getElementById('mm-col-ideas');
  const valueSynthesis = document.getElementById('mm-value-synthesis');
  const probInput = document.getElementById('div-problem-input');
  const valInput = document.getElementById('div-value-statement');
  const ideaInput = document.getElementById('div-idea-input');
  const lensSelect = document.getElementById('div-lens-select');
  const addIdeaBtn = document.getElementById('div-add-idea-btn');
  const togglePrunedBtn = document.getElementById('div-toggle-pruned-btn');
  const statsBadge = document.getElementById('div-stats-badge');
  const resetBtn = document.getElementById('div-reset-btn');

  if (!stageWrapper || !svgLayer || !ideasCol) return;

  const lensConfig = {
    exchange: { label: 'بازنگری مبادله', color: '#22d3ee', border: 'border-cyan-400/50', icon: '🔄' },
    access: { label: 'دسترسی اشتراکی', color: '#818cf8', border: 'border-indigo-400/50', icon: '🔑' },
    valuechain: { label: 'زنجیره ارزش', color: '#e879f9', border: 'border-fuchsia-400/50', icon: '⛓️' },
    analogical: { label: 'تفکر قیاسی', color: '#34d399', border: 'border-emerald-400/50', icon: '🧬' }
  };

  const defaultData = {
    problem: 'عدم شفافیت قیمت، واسطه‌گری‌های غیرمولد و اتلاف زمان کارگاه‌ها در استعلام تلفنی و خرید مواد اولیه.',
    valueStatement: 'پلتفرم خرید گروهی و حراج معکوس مواد اولیه صنعتی با تضمین اصالت و حذف واسطه‌های غیرمولد.',
    criteria: [true, true, true, true],
    showPruned: false,
    ideas: [
      { id: 101, text: 'حراج معکوس لحظه‌ای میان تأمین‌کنندگان تاییدشده برای هر سفارش', lens: 'exchange', status: 'selected' },
      { id: 102, text: 'اجاره زمانی تجهیزات آزمایشگاهی گران‌قیمت بین کارگاه‌های همجوار', lens: 'access', status: 'active' },
      { id: 103, text: 'تجمیع تقاضای خرد کارگاه‌ها و ثبت سفارش مستقیم به کارخانه مادر', lens: 'valuechain', status: 'selected' },
      { id: 104, text: 'رتبه‌بندی هوشمند خوش‌قولی باربری‌های صنعتی مشابه تاکسی‌های اینترنتی', lens: 'analogical', status: 'active' },
      { id: 105, text: 'تالار گفتگوی عمومی بدون تضمین مالی برای چانه‌زنی دستی', lens: 'exchange', status: 'pruned' }
    ]
  };

  const saved = localStorage.getItem('yazd_ec_mindmap_v2');
  let state = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultData));

  function saveState() {
    localStorage.setItem('yazd_ec_mindmap_v2', JSON.stringify(state));
  }

  probInput.value = state.problem;
  if (valInput) valInput.value = state.valueStatement || '';

  probInput.addEventListener('input', () => {
    state.problem = probInput.value;
    saveState();
  });

  valInput?.addEventListener('input', () => {
    state.valueStatement = valInput.value;
    saveState();
  });

  function updateCriteriaBadge() {
    const count = state.criteria.filter(Boolean).length;
    const badge = document.getElementById('mm-prob-score');
    if (badge) badge.textContent = `${count.toLocaleString('fa-IR')}/۴ معیار`;
  }

  document.querySelectorAll('.div-criteria-chk').forEach((chk, idx) => {
    chk.checked = state.criteria[idx] !== false;
    chk.addEventListener('change', () => {
      state.criteria[idx] = chk.checked;
      updateCriteriaBadge();
      if (window.spatialAudio) window.spatialAudio.playClick(580, 0.04);
      saveState();
    });
  });
  updateCriteriaBadge();

  document.querySelectorAll('[data-lens-node]').forEach(btn => {
    btn.addEventListener('click', () => {
      lensSelect.value = btn.getAttribute('data-lens-node');
      ideaInput.focus();
      if (window.spatialAudio) window.spatialAudio.playClick(640, 0.04);
    });
  });

  function getRelativePoint(el, side) {
    const stageRect = stageWrapper.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const x = side === 'left'
      ? (rect.left - stageRect.left + stageWrapper.scrollLeft)
      : (rect.right - stageRect.left + stageWrapper.scrollLeft);
    const y = (rect.top - stageRect.top + stageWrapper.scrollTop) + rect.height / 2;
    return { x, y };
  }

  function makeBezierPath(p1, p2) {
    const dx = Math.abs(p2.x - p1.x) * 0.48;
    return `M ${p1.x} ${p1.y} C ${p1.x - dx} ${p1.y}, ${p2.x + dx} ${p2.y}, ${p2.x} ${p2.y}`;
  }

  function drawConnections() {
    const w = Math.max(stageWrapper.scrollWidth, stageWrapper.clientWidth);
    const h = Math.max(stageWrapper.scrollHeight, stageWrapper.clientHeight);
    svgLayer.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svgLayer.style.width = `${w}px`;
    svgLayer.style.height = `${h}px`;

    let pathsHtml = '';
    const probLeft = getRelativePoint(probNode, 'left');
    const valRight = getRelativePoint(valNode, 'right');

    document.querySelectorAll('[data-lens-node]').forEach(lensEl => {
      const key = lensEl.getAttribute('data-lens-node');
      const cfg = lensConfig[key];
      const lensRight = getRelativePoint(lensEl, 'right');
      const d = makeBezierPath(probLeft, lensRight);
      pathsHtml += `<path d="${d}" class="mm-path-diverge" stroke="${cfg.color}" stroke-opacity="0.55" />`;
    });

    document.querySelectorAll('[data-idea-id]').forEach(ideaEl => {
      const id = Number(ideaEl.getAttribute('data-idea-id'));
      const item = state.ideas.find(i => i.id === id);
      if (!item) return;

      const lensEl = document.querySelector(`[data-lens-node="${item.lens}"]`);
      if (!lensEl) return;

      const cfg = lensConfig[item.lens] || lensConfig.exchange;
      const lensLeft = getRelativePoint(lensEl, 'left');
      const ideaRight = getRelativePoint(ideaEl, 'right');
      const ideaLeft = getRelativePoint(ideaEl, 'left');

      const dDiverge = makeBezierPath(lensLeft, ideaRight);
      if (item.status === 'pruned') {
        pathsHtml += `<path d="${dDiverge}" class="mm-path-pruned" />`;
      } else {
        pathsHtml += `<path d="${dDiverge}" class="mm-path-diverge" stroke="${cfg.color}" stroke-opacity="0.85" />`;
      }

      if (item.status === 'selected') {
        const dConverge = makeBezierPath(ideaLeft, valRight);
        pathsHtml += `<path d="${dConverge}" class="mm-path-converge" />`;
      }
    });

    svgLayer.innerHTML = pathsHtml;
  }

  function renderMindmap() {
    ideasCol.innerHTML = '';

    const activeItems = state.ideas.filter(i => i.status !== 'pruned');
    const prunedItems = state.ideas.filter(i => i.status === 'pruned');
    const selectedItems = state.ideas.filter(i => i.status === 'selected');

    if (statsBadge) {
      statsBadge.textContent = `${activeItems.length.toLocaleString('fa-IR')} شاخه فعال | ${selectedItems.length.toLocaleString('fa-IR')} همگرا | ${prunedItems.length.toLocaleString('fa-IR')} هرس‌شده`;
    }

    const convergedCountEl = document.getElementById('mm-converged-count');
    if (convergedCountEl) {
      convergedCountEl.textContent = `${selectedItems.length.toLocaleString('fa-IR')} شاخه همگرا`;
    }

    if (togglePrunedBtn) {
      togglePrunedBtn.textContent = state.showPruned
        ? 'پنهان‌کردن شاخه‌های هرس‌شده'
        : `نمایش هرس‌شده‌ها (${prunedItems.length.toLocaleString('fa-IR')})`;
    }

    const visibleIdeas = state.showPruned ? state.ideas : activeItems;

    visibleIdeas.forEach(item => {
      const cfg = lensConfig[item.lens] || lensConfig.exchange;
      const isSelected = item.status === 'selected';
      const isPruned = item.status === 'pruned';

      const node = document.createElement('div');
      node.setAttribute('data-idea-id', item.id);
      node.className = `mm-idea-node glass-pill p-3 rounded-2xl border ${
        isSelected ? 'border-emerald-400 bg-emerald-500/15 is-selected' : cfg.border
      } ${isPruned ? 'is-pruned border-rose-500/40' : ''}`;

      node.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/5" style="color:${cfg.color}">
            ${cfg.icon} ${cfg.label}
          </span>
          <div class="flex items-center gap-1 shrink-0">
            ${!isPruned ? `
              <button type="button" data-act="converge" class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition ${
                isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40'
              }" title="اتصال به هسته ارزش (همگرایی)">
                ${isSelected ? '🌟 همگرا شد' : '⬅ همگرایی'}
              </button>
              <button type="button" data-act="prune" class="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 text-[10px] font-bold transition" title="قطع و هرس این شاخه">
                ✂️ هرس
              </button>
            ` : `
              <button type="button" data-act="restore" class="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 text-[10px] font-bold transition">
                ♻️ پیوند مجدد
              </button>
            `}
          </div>
        </div>
        <p class="text-xs font-medium mt-2 leading-relaxed ${isPruned ? 'line-through text-rose-200' : ''}">${item.text}</p>
      `;

      node.querySelector('[data-act="converge"]')?.addEventListener('click', () => {
        item.status = item.status === 'selected' ? 'active' : 'selected';
        if (window.spatialAudio) window.spatialAudio.playBMCSectionReaction(2);
        saveState();
        renderMindmap();
      });

      node.querySelector('[data-act="prune"]')?.addEventListener('click', () => {
        item.status = 'pruned';
        if (window.spatialAudio) window.spatialAudio.playPruneSound();
        saveState();
        renderMindmap();
      });

      node.querySelector('[data-act="restore"]')?.addEventListener('click', () => {
        item.status = 'active';
        if (window.spatialAudio) window.spatialAudio.playClick(620, 0.04);
        saveState();
        renderMindmap();
      });

      ideasCol.appendChild(node);
    });

    valueSynthesis.innerHTML = selectedItems.length
      ? selectedItems.map(it => `<div class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-[11px]">✓ ${it.text}</div>`).join('')
      : `<div class="text-[11px] text-amber-300">روی دکمه «⬅ همگرایی» در گره‌های ایده کلیک کنید تا پرتوهای ارزش به این هسته متصل شوند.</div>`;

    requestAnimationFrame(() => {
      drawConnections();
    });
  }

  function addIdeaNode() {
    const text = ideaInput.value.trim();
    if (!text) return;
    state.ideas.push({
      id: Date.now(),
      text,
      lens: lensSelect.value,
      status: 'active'
    });
    ideaInput.value = '';
    if (window.spatialAudio) window.spatialAudio.playClick(720, 0.05);
    saveState();
    renderMindmap();
  }

  addIdeaBtn?.addEventListener('click', addIdeaNode);
  ideaInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addIdeaNode();
  });

  togglePrunedBtn?.addEventListener('click', () => {
    state.showPruned = !state.showPruned;
    if (window.spatialAudio) window.spatialAudio.playClick(520, 0.04);
    saveState();
    renderMindmap();
  });

  resetBtn?.addEventListener('click', () => {
    localStorage.removeItem('yazd_ec_mindmap_v2');
    state = JSON.parse(JSON.stringify(defaultData));
    probInput.value = state.problem;
    if (valInput) valInput.value = state.valueStatement;
    renderMindmap();
  });

  window.addEventListener('resize', drawConnections);
  stageWrapper.addEventListener('scroll', drawConnections);

  renderMindmap();
  setTimeout(drawConnections, 180);
}

/* ==========================================================================
   ۲. رادار ۸ بعدی سنجش ایده بالغ (تفکر همگرا)
   ========================================================================== */
function initIdeaRadarWorkshop() {
  const svg = document.getElementById('idea-radar-svg');
  const sliders = document.querySelectorAll('.radar-slider');
  const scoreOut = document.getElementById('radar-total-score');
  if (!svg || !sliders.length) return;

  const labels = [
    '۱. تقاضای بالفعل',
    '۲. نیاز واقعی',
    '۳. طبقه‌بندی ایده',
    '۴. مقیاس‌پذیری',
    '۵. تمایل پرداخت',
    '۶. ارزیابی میدانی',
    '۷. سناریوی واکنشی',
    '۸. جایگزین‌های فعلی'
  ];

  const cx = 150, cy = 150, maxR = 102;

  function renderRadar() {
    const vals = Array.from(sliders).map(s => Number(s.value));
    const sum = vals.reduce((a, b) => a + b, 0);
    const pct = Math.round((sum / 80) * 100);
    if (scoreOut) scoreOut.textContent = pct.toLocaleString('fa-IR') + '٪';

    let html = '';
    [0.25, 0.5, 0.75, 1].forEach(level => {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        const r = maxR * level;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      html += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1" />`;
    });

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const x2 = cx + maxR * Math.cos(angle);
      const y2 = cy + maxR * Math.sin(angle);
      const lx = cx + (maxR + 28) * Math.cos(angle);
      const ly = cy + (maxR + 22) * Math.sin(angle);
      html += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.18)" stroke-width="1" />`;
      html += `<text x="${lx}" y="${ly}" fill="currentColor" font-size="9.5" font-weight="700" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
    }

    const dataPts = vals.map((v, i) => {
      const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const r = (v / 10) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });

    html += `<polygon points="${dataPts.join(' ')}" fill="rgba(217, 70, 239, 0.32)" stroke="#e879f9" stroke-width="2.5" />`;

    vals.forEach((v, i) => {
      const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
      const r = (v / 10) * maxR;
      html += `<circle cx="${cx + r * Math.cos(angle)}" cy="${cy + r * Math.sin(angle)}" r="4.5" fill="#22d3ee" />`;
    });

    svg.innerHTML = html;
  }

  sliders.forEach(s => {
    s.addEventListener('input', () => {
      if (window.spatialAudio) window.spatialAudio.playClick(480 + Number(s.value) * 25, 0.03);
      renderRadar();
    });
  });

  renderRadar();
}

/* ==========================================================================
   ۳. بوم مدل کسب‌وکار ۹ بخشی (BMC) با ۹ ری‌اکشن اختصاصی و متمایز برای هر بخش
   ========================================================================== */
function initBMCWorkshop() {
  const container = document.getElementById('bmc-grid-container');
  if (!container) return;

  // هر یک از ۹ بخش دارای مجموعه ایموجی‌های ری‌اکشن اختصاصی و پالت کانفتی مرتبط با ماهیت همان بخش است
  const blocks = [
    {
      id: 'kp',
      title: '۱. شرکای کلیدی (Key Partners)',
      emoji: '🤝',
      reactionPool: ['🤝', '🔗', '🌐', '🤲', '🏢'],
      confettiColors: ['#38bdf8', '#0284c7', '#bae6fd'],
      items: ['تأمین‌کنندگان صنفی', 'شرکت‌های لجستیک و ارسال']
    },
    {
      id: 'ka',
      title: '۲. فعالیت‌های کلیدی (Key Activities)',
      emoji: '⚙️',
      reactionPool: ['⚙️', '⚡', '🛠️', '🔩', '🚀'],
      confettiColors: ['#818cf8', '#4f46e5', '#c7d2fe'],
      items: ['اعتبارسنجی تأمین‌کنندگان', 'توسعه و نگهداری پلتفرم']
    },
    {
      id: 'vp',
      title: '۳. ارزش پیشنهادی (Value Propositions)',
      emoji: '💎',
      reactionPool: ['💎', '🌟', '👑', '✨', '🏆'],
      confettiColors: ['#e879f9', '#c026d3', '#f5d0fe'],
      items: ['کاهش عدم تقارن اطلاعات', 'تضمین اصالت و قیمت پلکانی']
    },
    {
      id: 'cr',
      title: '۴. ارتباط با مشتری (Customer Relationships)',
      emoji: '💬',
      reactionPool: ['💬', '❤️', '🛡️', '🤗', '📞'],
      confettiColors: ['#fb7185', '#e11d48', '#fecdd3'],
      items: ['پشتیبانی هوشمند برخط', 'سیستم داوری و تضمین خرید']
    },
    {
      id: 'cs',
      title: '۵. بخش‌های مشتریان (Customer Segments)',
      emoji: '🎯',
      reactionPool: ['🎯', '👥', '🛍️', '🧑‍💻', '🏭'],
      confettiColors: ['#34d399', '#059669', '#a7f3d0'],
      items: ['خریداران خرد و کارگاهی', 'فروشندگان تخصصی صنف']
    },
    {
      id: 'kr',
      title: '۶. منابع کلیدی (Key Resources)',
      emoji: '🏛️',
      reactionPool: ['🏛️', '🗄️', '🧠', '🔑', '💻'],
      confettiColors: ['#a78bfa', '#7c3aed', '#ddd6fe'],
      items: ['موتور قیمت‌گذاری لحظه‌ای', 'پایگاه داده ساختاریافته']
    },
    {
      id: 'ch',
      title: '۷. کانال‌ها (Channels)',
      emoji: '📡',
      reactionPool: ['📡', '📱', '📣', '🌐', '🚚'],
      confettiColors: ['#22d3ee', '#0891b2', '#cffafe'],
      items: ['وب‌اپلیکیشن واکنش‌گرا', 'بازاریابی درون‌گرا و سئو']
    },
    {
      id: 'cost',
      title: '۸. ساختار هزینه‌ها (Cost Structure)',
      emoji: '🧾',
      reactionPool: ['🧾', '📉', '⚖️', '🧮', '💳'],
      confettiColors: ['#fb923c', '#ea580c', '#fed7aa'],
      items: ['زیرساخت ابری و سرور', 'هزینه جذب مشتری (CAC)']
    },
    {
      id: 'rev',
      title: '۹. جریان‌های درآمدی (Revenue Streams)',
      emoji: '💰',
      reactionPool: ['💰', '🪙', '💵', '📈', '🤑'],
      confettiColors: ['#fbbf24', '#d97706', '#fef08a'],
      items: ['کارمزد تراکنش (Escrow)', 'اشتراک ویژه تأمین‌کنندگان']
    }
  ];

  const saved = localStorage.getItem('yazd_ec_bmc_v2');
  const state = saved ? JSON.parse(saved) : blocks;

  function saveState() {
    localStorage.setItem('yazd_ec_bmc_v2', JSON.stringify(state));
  }

  // اجرای ری‌اکشن اختصاصی متناسب با اندیس هر یک از ۹ بلوک بوم کسب‌وکار
  function triggerSectionSpecificReaction(x, y, sectionIndex) {
    const blkMeta = blocks[sectionIndex] || blocks[0];
    const pool = blkMeta.reactionPool;

    for (let i = 0; i < 9; i++) {
      const el = document.createElement('div');
      el.className = 'floating-reaction-emoji';
      el.textContent = pool[i % pool.length];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);

      const angle = (Math.random() - 0.5) * Math.PI * 1.15;
      const dist = 65 + Math.random() * 95;
      const tx = Math.sin(angle) * dist;
      const ty = -Math.abs(Math.cos(angle) * dist) - 45;

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(el,
          { scale: 0.2, opacity: 1, x: 0, y: 0, rotation: 0 },
          {
            scale: 1.4,
            x: tx,
            y: ty,
            rotation: (Math.random() - 0.5) * 50,
            opacity: 0,
            duration: 0.95 + Math.random() * 0.35,
            ease: 'back.out(2)',
            onComplete: () => el.remove()
          }
        );
      } else {
        setTimeout(() => el.remove(), 900);
      }
    }

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 30,
        spread: 65,
        colors: blkMeta.confettiColors,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight }
      });
    }

    if (window.spatialAudio) {
      window.spatialAudio.playBMCSectionReaction(sectionIndex);
    }
  }

  function renderBMC() {
    container.innerHTML = '';
    state.forEach((blk, idx) => {
      const meta = blocks[idx] || blocks[0];
      const card = document.createElement('div');
      card.className = 'glass-pill p-4 rounded-2xl border border-white/15 bmc-block-spring flex flex-col justify-between gap-3 cursor-pointer hover:border-fuchsia-400/60';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-extrabold text-fuchsia-300">${blk.title}</span>
            <span class="text-xl" title="کلیک برای ری‌اکشن اختصاصی ${blk.title}">${meta.emoji}</span>
          </div>
          <div class="text-[10px] opacity-60 mb-2">ری‌اکشن اختصاصی: ${meta.reactionPool.join(' ')}</div>
          <ul class="space-y-1.5 text-xs">
            ${blk.items.map(it => `<li class="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">• ${it}</li>`).join('')}
          </ul>
        </div>
        <div class="flex gap-1.5 pt-2 border-t border-white/10">
          <input type="text" placeholder="افزودن مورد جدید..." class="bmc-add-input glass-input text-xs px-2.5 py-1.5 rounded-lg flex-1" />
          <button class="bmc-add-btn px-2.5 py-1.5 rounded-lg bg-fuchsia-500/30 hover:bg-fuchsia-500/50 text-xs font-bold">+</button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('input, button')) return;
        triggerSectionSpecificReaction(e.clientX, e.clientY, idx);
      });

      const inp = card.querySelector('.bmc-add-input');
      const btn = card.querySelector('.bmc-add-btn');
      const addItem = () => {
        const val = inp.value.trim();
        if (!val) return;
        state[idx].items.push(val);
        saveState();
        renderBMC();
        const rect = btn.getBoundingClientRect();
        triggerSectionSpecificReaction(rect.left, rect.top, idx);
      };

      btn.addEventListener('click', addItem);
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addItem();
      });

      container.appendChild(card);
    });
  }

  document.getElementById('bmc-celebrate-btn')?.addEventListener('click', (e) => {
    triggerSectionSpecificReaction(e.clientX, e.clientY, 8);
  });

  document.getElementById('bmc-load-sample')?.addEventListener('click', () => {
    localStorage.removeItem('yazd_ec_bmc_v2');
    location.reload();
  });

  renderBMC();
}

/* ==========================================================================
   ۴. کنترلر شبیه‌ساز سه‌بعدی قیف بازاریابی AIDA
   ========================================================================== */
function initAidaFunnelWorkshop() {
  const inpA = document.getElementById('inp-aida-a');
  const inpI = document.getElementById('inp-aida-i');
  const inpD = document.getElementById('inp-aida-d');
  const inpAct = document.getElementById('inp-aida-act');
  const inpRev = document.getElementById('inp-aida-rev');

  if (!inpA) return;

  function updateAida() {
    const a = Number(inpA.value);
    const iRate = Number(inpI.value);
    const dRate = Number(inpD.value);
    const actRate = Number(inpAct.value);
    const revPerOrder = Number(inpRev.value);

    const interested = Math.round(a * (iRate / 100));
    const desired = Math.round(interested * (dRate / 100));
    const customers = Math.max(1, Math.round(desired * (actRate / 100)));
    const totalRevenue = customers * revPerOrder;

    document.getElementById('val-aida-a').textContent = `${a.toLocaleString('fa-IR')} کاربر`;
    document.getElementById('val-aida-i').textContent = `${iRate.toLocaleString('fa-IR')}٪ (${interested.toLocaleString('fa-IR')} نفر)`;
    document.getElementById('val-aida-d').textContent = `${dRate.toLocaleString('fa-IR')}٪ (${desired.toLocaleString('fa-IR')} نفر)`;
    document.getElementById('val-aida-act').textContent = `${actRate.toLocaleString('fa-IR')}٪ (${customers.toLocaleString('fa-IR')} خریدار)`;
    document.getElementById('val-aida-rev').textContent = `${revPerOrder.toLocaleString('fa-IR')} تومان`;

    document.getElementById('out-aida-customers').textContent = customers.toLocaleString('fa-IR') + ' نفر';
    document.getElementById('out-aida-cashflow').textContent = totalRevenue.toLocaleString('fa-IR') + ' تومان';

    // اعمال آنی تغییرات روی هندسه ۴ حلقه قیف سه‌بعدی و سرعت جریان عمودی ذرات
    if (window.portalThree) {
      window.portalThree.updateFunnelGeometry(a, iRate, dRate, actRate, revPerOrder);
    }
  }

  [inpA, inpI, inpD, inpAct, inpRev].forEach(el => {
    el.addEventListener('input', () => {
      if (window.spatialAudio) window.spatialAudio.playClick(540, 0.025);
      updateAida();
    });
  });

  // اطمینان از همگام‌سازی اولیه پس از بارگذاری صحنه سه‌بعدی
  setTimeout(updateAida, 120);
}

/* ==========================================================================
   ۵. استودیوی تدوین شناسنامه سناریو (BDD Given-When-Then) + تشخیص ضدالگو
   ========================================================================== */
function initBDDScenarioStudio() {
  const fields = ['bdd-id', 'bdd-role', 'bdd-title', 'bdd-goal', 'bdd-given', 'bdd-when', 'bdd-then'];
  const preview = document.getElementById('bdd-markdown-preview');
  const alertBox = document.getElementById('bdd-linter-alert');
  if (!preview) return;

  const superficialPatterns = ['حالت تیره', 'حالت روشن', 'دارک مود', 'dark mode', 'لودینگ', 'اسکلتون', 'skeleton', 'فرم تماس ایستا'];

  function updateBDD() {
    const id = document.getElementById('bdd-id').value.trim();
    const role = document.getElementById('bdd-role').value.trim();
    const title = document.getElementById('bdd-title').value.trim();
    const goal = document.getElementById('bdd-goal').value.trim();
    const given = document.getElementById('bdd-given').value.trim();
    const when = document.getElementById('bdd-when').value.trim();
    const then = document.getElementById('bdd-then').value.trim();

    const combinedText = `${title} ${goal} ${when}`.toLowerCase();
    const hasAntiPattern = superficialPatterns.some(pat => combinedText.includes(pat));

    if (hasAntiPattern) {
      alertBox.classList.remove('hidden');
      if (window.spatialAudio) window.spatialAudio.playWarningBuzz();
    } else {
      alertBox.classList.add('hidden');
    }

    const md = `### شناسه سناریو: ${id}
* **عنوان سناریو:** ${title}
* **نقش کاربری:** ${role}
* **هدف و ارزش تجاری:** ${goal}
* **پیش‌شرط‌ها:** کاربر احراز هویت شده و داده‌های پایه (Seed Data) بارگذاری شده است.
* **مسیر اصلی اقدام:**
  ۱. کاربر مقادیر مشخص را در سامانه ثبت می‌نماید.
  ۲. سیستم داده‌ها را اعتبارسنجی کرده و محاسبات تجاری را اعمال می‌کند.
  ۳. وضعیت جدید در لایه داده ثبت گردیده و خروجی مناسب ارائه می‌شود.
* **مدیریت خطاهای مرزی:** بررسی ورودی‌های خارج از دامنه و نمایش پیام خطای استاندارد در صورت فقدان موجودی.
* **معیار پذیرش آزمون (Acceptance Criteria):**
  - **Given (فرض اولیه):** ${given}
  - **When (اقدام):** ${when}
  - **Then (نتیجه):** ${then}`;

    preview.textContent = md;
  }

  fields.forEach(fid => {
    document.getElementById(fid)?.addEventListener('input', updateBDD);
  });

  document.getElementById('bdd-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(preview.textContent);
    if (window.spatialAudio) window.spatialAudio.playBMCSectionReaction(8);
    const btn = document.getElementById('bdd-copy-btn');
    const oldText = btn.textContent;
    btn.textContent = '✅ در حافظه کپی شد!';
    setTimeout(() => { btn.textContent = oldText; }, 1800);
  });

  updateBDD();
}

/* ==========================================================================
   ۶. ماشین‌حساب هوشمند ارزیابی روبریک، کسر نمره مایلستون و فریز ۴ ساعته
   ========================================================================== */
function initRubricCalculatorWorkshop() {
  const sliders = document.querySelectorAll('.rubric-slider');
  const chk1 = document.getElementById('chk-phase-1');
  const chk2 = document.getElementById('chk-phase-2');
  const chk3 = document.getElementById('chk-phase-3');
  const timeInp = document.getElementById('appointment-time-input');

  if (!sliders.length) return;

  function updateRubricCalc() {
    const r1 = Number(document.getElementById('rng-rub-1').value);
    const r2 = Number(document.getElementById('rng-rub-2').value);
    const r3 = Number(document.getElementById('rng-rub-3').value);
    const r4 = Number(document.getElementById('rng-rub-4').value);
    const r5 = Number(document.getElementById('rng-rub-5').value);
    const r6 = Number(document.getElementById('rng-rub-6').value);
    const bonus = Number(document.getElementById('rng-rub-bonus').value);

    document.getElementById('lbl-rub-1').textContent = r1.toFixed(2);
    document.getElementById('lbl-rub-2').textContent = r2.toFixed(2);
    document.getElementById('lbl-rub-3').textContent = r3.toFixed(2);
    document.getElementById('lbl-rub-4').textContent = r4.toFixed(2);
    document.getElementById('lbl-rub-5').textContent = r5.toFixed(2);
    document.getElementById('lbl-rub-6').textContent = r6.toFixed(2);
    document.getElementById('lbl-rub-bonus').textContent = bonus.toFixed(2);

    let missedPhases = 0;
    if (!chk1.checked) missedPhases++;
    if (!chk2.checked) missedPhases++;
    if (!chk3.checked) missedPhases++;

    const penalty = missedPhases * 0.5;
    const effectiveCeiling = 6.0 - penalty;

    const rawBaseScore = r1 + r2 + r3 + r4 + r5 + r6;
    const cappedBaseScore = Math.min(rawBaseScore, effectiveCeiling);
    const totalWithBonus = cappedBaseScore + bonus;

    document.getElementById('calc-ceiling-display').textContent =
      `${effectiveCeiling.toFixed(1)} از ۶٫۰ نمره (کسر ${penalty.toFixed(1)} نمره بابت غیبت فازها)`;
    document.getElementById('calc-final-grade').textContent =
      `${totalWithBonus.toFixed(2)} نمره کل`;
  }

  function updateFreezeClock() {
    if (!timeInp || !timeInp.value) return;
    const [hh, mm] = timeInp.value.split(':').map(Number);
    let freezeHour = hh - 4;
    let dayLabel = 'همان روز ارائه';
    if (freezeHour < 0) {
      freezeHour += 24;
      dayLabel = 'شبِ روز قبل از ارائه';
    }
    const fStr = `${String(freezeHour).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    document.getElementById('freeze-deadline-output').textContent = `ساعت ${fStr} (${dayLabel})`;
  }

  sliders.forEach(s => s.addEventListener('input', updateRubricCalc));
  [chk1, chk2, chk3].forEach(c => c.addEventListener('change', () => {
    if (window.spatialAudio) window.spatialAudio.playClick(420, 0.05);
    updateRubricCalc();
  }));
  timeInp?.addEventListener('input', updateFreezeClock);

  updateRubricCalc();
  updateFreezeClock();
}