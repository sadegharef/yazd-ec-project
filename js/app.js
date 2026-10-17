/**
 * کنترلر اصلی پرتال تجارت الکترونیکی دانشگاه یزد
 * مشترک میان صفحه اصلی مستندات (index.html) و صفحه کارگاه‌های تعاملی (workshops.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ۱. راه‌اندازی اسکرول نرم Lenis
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ۲. نوار پیشرفت مطالعه در بالاترین نقطه صفحه
  const progressBar = document.getElementById('scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
  });

  // ۳. همگام‌سازی بخش‌های مستندات با هسته سه‌بعدی پس‌زمینه (Scrollytelling)
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('section[data-scene-stage]').forEach((sec) => {
      const stageNum = Number(sec.getAttribute('data-scene-stage'));
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 60%',
        onEnter: () => {
          if (window.portalThree) window.portalThree.TransitionToStage(stageNum);
        },
        onEnterBack: () => {
          if (window.portalThree) window.portalThree.TransitionToStage(stageNum);
        }
      });
    });
  }

  // ۴. مدیریت کامپوننت یکپارچه پایین-راست: ۴ پالت رنگی ارگونومیک با ذخیره‌سازی پایدار
  const themeButtons = document.querySelectorAll('[data-set-theme]');
  const savedTheme = localStorage.getItem('yazd_ec_portal_theme') || 'dark-spatial';

  function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('yazd_ec_portal_theme', themeName);
    themeButtons.forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-set-theme') === themeName);
    });
  }

  applyTheme(savedTheme);

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTheme = btn.getAttribute('data-set-theme');
      applyTheme(targetTheme);
      if (window.spatialAudio) window.spatialAudio.playClick(620, 0.04);
    });
  });

  // ۵. کلید صدای فضایی در کامپوننت یکپارچه پایین-راست
  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioIcon = document.getElementById('audio-icon');

  if (audioIcon && window.spatialAudio) {
    audioIcon.textContent = window.spatialAudio.enabled ? '🔊' : '🔇';
  }

  audioBtn?.addEventListener('click', () => {
    if (!window.spatialAudio) return;
    const state = window.spatialAudio.toggle();
    if (audioIcon) {
      audioIcon.textContent = state ? '🔊' : '🔇';
    }
  });

  // ۶. دکمه مینیمال حالت تمرکز ۳بعدی در پایین-چپ
  const focusBtn = document.getElementById('toggle-3d-focus');
  focusBtn?.addEventListener('click', () => {
    document.body.classList.toggle('focus-3d-mode');
    const isFocus = document.body.classList.contains('focus-3d-mode');
    focusBtn.textContent = isFocus ? '✕ خروج از تمرکز ۳بعدی' : '🧊 تمرکز ۳بعدی';
    if (window.spatialAudio) window.spatialAudio.playClick(740, 0.05);
  });

  // ۷. باز و بسته کردن نرم تقویم نوبت‌دهی Google Calendar در بخش ۸
  const toggleCalBtn = document.getElementById('toggle-calendar-embed');
  const calContainer = document.getElementById('calendar-embed-container');
  toggleCalBtn?.addEventListener('click', () => {
    if (!calContainer) return;
    const isHidden = calContainer.classList.toggle('hidden');
    toggleCalBtn.textContent = isHidden
      ? '📅 نمایش تقویم رزرو نوبت در همین صفحه'
      : '🔼 بستن قاب تقویم';
    if (window.spatialAudio) window.spatialAudio.playClick(580, 0.05);
  });
});