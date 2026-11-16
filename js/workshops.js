/**
 * موتور تعاملی ابزارهای کمکی پروژه تجارت الکترونیکی دانشگاه یزد (نسخه ۵)
 * شامل ۶ ابزار کاربردی تولید مستندات پروژه با ذخیره‌سازی پایدار در مرورگر:
 * ۱. مدل تفکر طراحی جین لیدکا (۴ پرسش واگرا-همگرا و ۱۰ ابزار عملیاتی از مسئله تا ایده پخته)
 * ۲. رادار هندسی ۸ معیار ایده بالغ
 * ۳. بوم مدل کسب‌وکار ۹ بخشی اوستروالدر (BMC)
 * ۴. شبیه‌ساز سه‌بعدی قیف فروش (AIDA) و اقتصاد واحد (CAC)
 * ۵. معمار ۱۰ سناریوی عملیاتی MVP و مولد اسناد README.md و AI_DISCLOSURE.md
 * ۶. محاسبه‌گر هوشمند روبریک ۶+۱ و زمان‌سنج فریز ۴ ساعته کد
 */

(function () {
  const STORAGE_KEY = 'yazd_ec_tools_v5';

  function showToast(message, tone = 'info') {
    let container = document.getElementById('portal-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'portal-toast-container';
      container.className = 'fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-xs pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className =
      'pointer-events-auto surface-sheet px-4 py-2.5 rounded-lg text-xs font-medium shadow-lg transition-all duration-200 translate-y-2 opacity-0 flex items-center gap-2';
    if (tone === 'error') {
      toast.style.borderColor = 'var(--danger)';
      toast.style.color = 'var(--danger)';
    } else if (tone === 'success') {
      toast.style.borderColor = 'var(--accent)';
    }
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 220);
    }, 2500);
  }

  window.showPortalToast = showToast;

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function copyMarkdown(text, successMsg = 'متن استاندارد Markdown در حافظه کپی شد.') {
    try {
      await navigator.clipboard.writeText(text);
      if (window.spatialAudio) window.spatialAudio.playSuccess();
      showToast(successMsg, 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast(successMsg, 'success');
    }
  }

  function downloadFile(filename, content, mime = 'text/markdown;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    if (window.spatialAudio) window.spatialAudio.playSuccess();
    showToast(`فایل ${filename} آماده و دانلود شد.`, 'success');
  }

  function createScenarioTemplate(index = 1, overrides = {}) {
    const num = String(index).padStart(2, '0');
    return {
      id: `SC-${num}`,
      role: 'کاربر سامانه',
      title: `سناریوی تجاری ${num}`,
      goal: 'رفع یک اصطکاک مشخص با پردازش قواعد کسب‌وکار و تغییر وضعیت داده',
      preconditions: 'کاربر احراز هویت شده و داده‌های پایه (Seed Data) بارگذاری شده است.',
      edgeCase: 'اعتبارسنجی ورودی‌های خارج از دامنه و نمایش پیام خطای راهنما بدون شکستن حالت برنامه.',
      given: 'کاربر با نقش معتبر در وضعیت اولیه قرار دارد.',
      when: 'کنش اصلی تجاری را ثبت و تایید می‌نماید.',
      then: 'قواعد تجاری اعمال شده، وضعیت جدید ذخیره و خروجی نمایش داده می‌شود.',
      phase4Status: 'پیاده‌سازی کامل',
      evolutionNote: 'تدوین اولیه در فاز سوم و بازبینی نهایی در فاز چهارم.',
      ...overrides
    };
  }

  const PRESETS = {
    b2b: {
      meta: {
        title: 'سامانه تأمین مواد اولیه کارگاه‌های تولیدی',
        student: 'دانشجوی مهندسی کامپیوتر — دانشگاه یزد',
        domain: 'بازارگاه B2B صنعتی و زنجیره تأمین'
      },
      liedtka: {
        visualization: 'مقایسه تصویری فرآیند استعلام تلفنی ۳ ساعته در برابر داشبورد یکپارچه استعلام پلکانی، مقایسه پیشنهادها و صدور آنی پیش‌فاکتور رسمی.',
        persona: 'مسئولان خرید کارگاه‌های تولیدی کوچک و متوسط شهرک صنعتی',
        journeySteps: [
          { id: 1, step: 'جستجوی تأمین‌کننده در دفترچه تلفن و کانال‌های پراکنده', pain: 'نبود اطلاعات موجودی واقعی و اعتبار نامشخص فروشنده' },
          { id: 2, step: 'تماس تلفنی مکرر با ۵ تا ۸ بنکدار برای استعلام قیمت روز', pain: 'اتلاف روزانه ۳ ساعت زمان و دریافت قیمت‌های شفاهی غیرشفاف' },
          { id: 3, step: 'واریز نقدی پیش‌پرداخت و انتظار ارسال بار', pain: 'ریسک مغایرت کیفیت مواد ارسالی و نبود تضمین بازگشت وجه' }
        ],
        valueChainActors: 'کارخانه مادر ← عمده‌فروش استانی ← واسطه‌های تلفنی ← کارگاه تولیدی خرد',
        valueChainLeakage: 'کارگاه‌های خرد به دلیل حجم خرید پایین از تخفیف پلکانی کارخانه محروم‌اند و واسطه‌های غیرمولد بدون خلق ارزش ۱۵٪ حاشیه قیمت اضافه می‌کنند.',
        mindMapClusters: ['ابهام قیمت لحظه‌ای', 'ضعف قدرت چانه‌زنی سفارش خرد', 'ریسک تسویه نقدی پیش از تحویل', 'نبود سابقه خوش‌قولی تأمین‌کننده'],
        designCriteria: 'راه‌حل نهایی باید بدون نیاز به تماس تلفنی، قیمت پلکانی شفاف ارائه دهد، سفارش‌های خرد را تجمیع کند و تسویه مالی را به تایید سلامت بار مشروط سازد.',
        whatIfs: [
          { id: 101, text: 'چه می‌شود اگر به جای استعلام خریدار، تأمین‌کنندگان در یک مناقصه معکوس ۲ ساعته روی سفارش رقابت کنند؟', lens: 'بازنگری مبادله', status: 'shortlisted' },
          { id: 102, text: 'چه می‌شود اگر سفارش‌های خرد چند کارگاه هم‌جوار تجمیع شود تا به حد نصاب تخفیف عمده کارخانه برسد؟', lens: 'زنجیره ارزش', status: 'shortlisted' },
          { id: 103, text: 'چه می‌شود اگر مبلغ فاکتور در حساب امانی (Escrow) بماند و فقط پس از تایید کیفیت آزاد شود؟', lens: 'بازنگری مبادله', status: 'shortlisted' },
          { id: 104, text: 'چه می‌شود اگر امتیاز خوش‌قولی تأمین‌کننده مانند سامانه‌های تاکسی اینترنتی بر اساس زمان تحویل واقعی محاسبه شود؟', lens: 'تفکر قیاسی', status: 'active' },
          { id: 105, text: 'چه می‌شود اگر صرفاً یک سایت نیازمندی متنی با شماره تلفن فروشندگان بسازیم؟', lens: 'زنجیره ارزش', status: 'pruned' }
        ],
        concepts: [
          {
            id: 201,
            title: 'بازارگاه مناقصه معکوس و خرید تجمیعی با سپر امانی',
            mechanism: 'ثبت سبد استعلام توسط کارگاه + تجمیع تقاضای هم‌زمان + رقابت تأمین‌کنندگان و تسویه امانی Sandbox',
            edge: 'هم هزینه خرید را با تجمیع کاهش می‌دهد و هم با تسویه امانی مانع دور زدن پلتفرم می‌شود.',
            selected: true
          },
          {
            id: 202,
            title: 'کاتالوگ آنلاین تک‌فروشگاهی مواد اولیه',
            mechanism: 'فروش مستقیم توسط یک انبار متمرکز',
            edge: 'نیازمند سرمایه سنگین انبارداری است و مقیاس‌پذیری پلتفرمی ندارد.',
            selected: false
          }
        ],
        assumptions: [
          { id: 301, category: 'مطلوبیت مشتری', text: 'مدیران خرید کارگاه‌ها حاضرند سفارش خود را آنلاین ثبت کنند و ۲ ساعت منتظر بسته شدن مناقصه بمانند.', testMethod: 'مصاحبه و تست سناریو با ۵ مسئول خرید کارگاه', status: 'validated' },
          { id: 302, category: 'پایداری مالی', text: 'تأمین‌کنندگان پس از اولین معامله، خریدار را به خارج از پلتفرم هدایت نمی‌کنند.', testMethod: 'وابسته کردن تخفیف تجمیعی و تضمین تسویه امانی به ثبت در سامانه', status: 'validated' },
          { id: 303, category: 'امکان‌پذیری فنی', text: 'موتور محاسبه تخفیف پلکانی و صدور پیش‌فاکتور در یک نیم‌سال به صورت کامل قابل پیاده‌سازی است.', testMethod: 'طراحی اسکیمای داده در فاز اول و تست مسیر اصلی در فاز دوم', status: 'validated' }
        ],
        prototypePlan: 'وایرفریم تعاملی ۳ صفحه‌ای شامل: ۱) فرم ثبت سبد استعلام با محاسبه پلکانی، ۲) جدول مقایسه پیشنهادهای تأمین‌کنندگان، ۳) پیش‌فاکتور رسمی و تایید سپرده‌گذاری امانی.',
        coCreationFeedback: 'در نمایش نمونه اولیه به ۳ کارگاه مشخص شد مدیران خرید قبل از کمترین قیمت، به «زمان تحویل قطعی» و «فاکتور رسمی» حساسیت دارند.',
        pivotMade: 'رتبه‌بندی پیشنهادها از «صرفاً ارزان‌ترین قیمت» به «امتیاز ترکیبی قیمت + تعهد زمان تحویل» اصلاح شد.',
        mvpScope: 'پیاده‌سازی کامل چرخه ثبت درخواست استعلام، پیشنهاددهی تأمین‌کننده، محاسبه تخفیف حجمی و صدور پیش‌فاکتور امانی در محیط آزمایشی.',
        successMetric: 'کاهش زمان استعلام و صدور پیش‌فاکتور از ۳ ساعت به کمتر از ۱۰ دقیقه در تست کاربری.',
        valueStatement: 'سامانه تأمین هوشمند برای کارگاه‌های تولیدی که با ابهام قیمت و استعلام‌های تلفنی فرسایشی روبه‌رو هستند، از طریق تجمیع سفارش‌ها، مناقصه معکوس تأمین‌کنندگان و تسویه امانی، قیمت عمده شفاف و تحویل تضمین‌شده فراهم می‌کند.'
      },
      radar: {
        scores: [8, 8, 9, 7, 8, 9, 7, 8],
        ideaType: 'ترکیبی (Combination)',
        evidence: [
          'مصاحبه اولیه با مدیران خرید چند کارگاه فعال در شهرک صنعتی یزد',
          'ثبت میانگین ۳ تا ۴ ساعت تماس روزانه برای استعلام قیمت مواد مصرفی',
          'ترکیب سازوکار مناقصه معکوس B2B با آزادسازی مشروط وجه (Escrow)',
          'قابلیت تعمیم از یک رسته صنفی در یزد به سایر خوشه‌های صنعتی کشور',
          'تمایل به پرداخت کارمزد ۱٫۵ تا ۳ درصدی در برابر تضمین اصالت و قیمت عمده',
          'امکان آزمون نمونه اولیه با ۵ کارگاه در دسترس در فاز دوم',
          'جایگزینی خودکار تأمین‌کننده پشتیبان در صورت عدم تحویل بهنگام',
          'روش فعلی: استعلام تلفنی، گروه‌های پیام‌رسان و خرید از واسطه‌های سنتی'
        ]
      },
      bmc: {
        kp: ['تأمین‌کنندگان و کارخانه‌های احرازشده', 'شرکت‌های حمل‌ونقل صنعتی', 'درگاه آزمایشی پرداخت امانی (Sandbox)'],
        ka: ['احراز صلاحیت تأمین‌کنندگان', 'پردازش مناقصه معکوس و تخفیف پلکانی', 'پشتیبانی و داوری اختلافات'],
        kr: ['پایگاه داده موجودی و قیمت پلکانی', 'الگوریتم امتیاز اعتماد طرفین', 'موتور صدور پیش‌فاکتور رسمی'],
        vp: ['شفافیت لحظه‌ای قیمت پلکانی', 'تضمین اصالت با تسویه امانی', 'تجمیع سفارش خرد برای دستیابی به نرخ عمده'],
        cr: ['داشبورد رهگیری وضعیت سفارش', 'ضمانت بازگشت وجه امانی در صورت مغایرت'],
        ch: ['وب‌اپلیکیشن واکنش‌گرا', 'سئو تخصصی کلمات کلیدی صنعتی (Inbound)', 'اطلاع‌رسانی مناقصه‌های باز'],
        cs: ['کارگاه‌های تولیدی کوچک و متوسط (خریداران)', 'تأمین‌کنندگان و تولیدکنندگان مواد اولیه'],
        cost: ['توسعه و نگهداری زیرساخت وب', 'هزینه بازاریابی و جذب کارگاه‌های اولیه', 'عملیات اعتبارسنجی و پشتیبانی'],
        rev: ['کارمزد تراکنش موفق امانی', 'اشتراک پنل تحلیلی ویژه تأمین‌کنندگان', 'کارمزد سفارش‌های تجمیعی']
      },
      aida: { a: 10000, i: 45, d: 30, act: 20, rev: 250000, spend: 15000000 },
      scenarios: [
        createScenarioTemplate(1, {
          id: 'SC-01',
          role: 'خریدار سازمانی',
          title: 'استعلام قیمت پلکانی لحظه‌ای و صدور پیش‌فاکتور قابل چاپ',
          goal: 'حذف استعلام تلفنی و محاسبه خودکار تخفیف حجمی بر پایه موجودی',
          given: 'خریدار وارد حساب خود شده و حداقل ۳ قلم کالا را در سبد استعلام ثبت کرده است.',
          when: 'مقادیر درخواستی را وارد کرده و گزینه «محاسبه پلکانی و صدور پیش‌فاکتور» را انتخاب می‌کند.',
          then: 'موجودی بررسی شده، ضریب تخفیف حجمی اعمال و پیش‌فاکتور با کد رهگیری در لایه داده ذخیره می‌شود.'
        }),
        createScenarioTemplate(2, {
          id: 'SC-02',
          role: 'تأمین‌کننده',
          title: 'ثبت پیشنهاد قیمت رقابتی در مناقصه معکوس با کنترل کف قیمت',
          goal: 'رقابتی‌سازی شفاف قیمت‌ها و جلوگیری از ثبت اعداد نامعتبر',
          given: 'درخواست استعلام باز با مهلت معتبر در کارتابل تأمین‌کننده فعال است.',
          when: 'قیمت پیشنهادی واحد و زمان تحویل را ثبت و ارسال می‌نماید.',
          then: 'پیشنهاد اعتبارسنجی شده، رتبه رقابتی به‌روزرسانی و وضعیت در سامانه پایدار می‌گردد.'
        }),
        createScenarioTemplate(3, {
          id: 'SC-03',
          role: 'خریدار / مدیر مالی',
          title: 'پرداخت امانی آزمایشی (Sandbox Escrow) و آزادسازی مشروط وجه',
          goal: 'حذف ریسک عدم ایفای تعهد و جلوگیری از دور زدن پلتفرم',
          given: 'پیش‌فاکتور نهایی در وضعیت «در انتظار سپرده‌گذاری امانی» قرار دارد.',
          when: 'تراکنش آزمایشی ثبت شده و سپس تاییدیه سلامت مرسوله توسط خریدار ثبت می‌شود.',
          then: 'وضعیت سفارش به «تسویه‌شده» تغییر یافته و کارمزد پلتفرم در صورت‌حساب لحاظ می‌شود.'
        })
      ],
      readme: {
        repoUrl: 'https://github.com/username/yazd-ec-project',
        liveUrl: 'https://my-ec-project.vercel.app',
        stack: 'HTML5, TailwindCSS, Modern JavaScript (ES6+), LocalStorage / Supabase',
        setup: 'git clone <repo-url>\ncd project\nnpm install\nnpm run dev',
        env: 'VITE_APP_MODE=sandbox\nVITE_API_BASE_URL=http://localhost:5173',
        accounts: 'خریدار آزمایشی: buyer@yazd.ac.ir / 123456\nتأمین‌کننده آزمایشی: supplier@yazd.ac.ir / 123456'
      },
      ai: {
        tools: 'Claude / ChatGPT / Cursor',
        tier: 'نسخه رایگان و آموزشی',
        strategy: 'طراحی ساختار داده و معیارهای پذیرش هر سناریو پیش از تولید کد و هدایت مدل در گام‌های ماژولار کوچک.',
        architecture: 'جداسازی لایه مدیریت وضعیت (Store) از رابط کاربری و پیاده‌سازی موتور قواعد قیمت‌گذاری به صورت توابع مستقل.',
        debugLog: 'بازنویسی دستی منطق بررسی تداخل موجودی و اصلاح چینش راست‌به‌چپ جدول پیش‌فاکتور پس از تست مرزی.'
      },
      rubric: {
        scores: [0.9, 0.9, 0.9, 1.3, 1.0, 1.0, 0.5],
        phases: [true, true, true],
        date: '',
        time: '14:00',
        audit: [false, false, false, false, false, false]
      }
    },
    b2c: {
      meta: {
        title: 'سامانه رزرواسیون هوشمند خدمات تخصصی و مدیریت ظرفیت',
        student: 'دانشجوی مهندسی کامپیوتر — دانشگاه یزد',
        domain: 'پلتفرم خدمات B2C محلی'
      },
      liedtka: {
        visualization: 'نمایش تقویم زنده اسلات‌های خالی مرکز خدماتی در کنار جایگزینی خودکار نوبت سوخته از لیست انتظار.',
        persona: 'شهروندان متقاضی خدمات تخصصی و مدیران مراکز خدماتی دارای ظرفیت زمانی محدود در یزد',
        journeySteps: [
          { id: 1, step: 'تماس تلفنی در ساعات اداری برای پرسیدن وقت خالی', pain: 'اشغال بودن خط و محدودیت زمانی پاسخگویی منشی' },
          { id: 2, step: 'ثبت دستی نوبت در دفتر کاغذی مرکز', pain: 'بروز تداخل نوبت‌ها و معطلی طولانی در سالن انتظار' },
          { id: 3, step: 'لغو دقیقه نودی توسط مراجعه‌کننده بدون اطلاع قبلی', pain: 'سوخت شدن ظرفیت درآمدی مرکز و محروم ماندن سایر متقاضیان' }
        ],
        valueChainActors: 'متقاضی خدمت ← تماس تلفنی / منشی ← متخصص / مرکز خدماتی',
        valueChainLeakage: 'عدم همگام‌سازی لحظه‌ای ظرفیت خالی با تقاضای در صف انتظار باعث اتلاف ۳۰٪ ساعت‌های کاری مراکز می‌شود.',
        mindMapClusters: ['تداخل نوبت‌های دفتری', 'ظرفیت سوخته ناشی از کنسلی', 'ابهام تعرفه خدمات پیش از مراجعه'],
        designCriteria: 'سامانه باید رزرو شبانه‌روزی بدون تداخل با قفل موقت اسلات فراهم کند و در صورت لغو نوبت، به شکل خودکار نفر اول صف انتظار را جایگزین سازد.',
        whatIfs: [
          { id: 201, text: 'چه می‌شود اگر به محض کنسل شدن یک نوبت، سامانه با بیعانه آزمایشی آن اسلات را به نفر اول لیست انتظار تخصیص دهد؟', lens: 'زنجیره ارزش', status: 'shortlisted' },
          { id: 202, text: 'چه می‌شود اگر ساعت‌های کم‌ترافیک صبحگاهی با تعرفه تخفیف‌دار پویا عرضه شوند؟', lens: 'تفکر قیاسی', status: 'shortlisted' },
          { id: 203, text: 'چه می‌شود اگر هنگام انتخاب ساعت، اسلات برای ۱۰ دقیقه قفل موقت شود تا دو نفر هم‌زمان رزرو نکنند؟', lens: 'بازنگری مبادله', status: 'shortlisted' }
        ],
        concepts: [
          {
            id: 211,
            title: 'پلتفرم نوبت‌دهی بدون تداخل با موتور جایگزینی خودکار لیست انتظار',
            mechanism: 'تقویم زنده + قفل موقت اسلات + بیعانه آزمایشی و فراخوان هوشمند صف انتظار',
            edge: 'هم معطلی مراجع را صفر می‌کند و هم زیان مالی کنسلی مراکز را از بین می‌برد.',
            selected: true
          }
        ],
        assumptions: [
          { id: 311, category: 'مطلوبیت مشتری', text: 'مراجعان حاضرند برای قطعی شدن نوبت بدون معطلی، بیعانه جزئی بپردازند.', testMethod: 'نظرسنجی از ۱۲ مراجعه‌کننده واقعی مراکز خدماتی', status: 'validated' },
          { id: 312, category: 'پایداری مالی', text: 'مراکز خدماتی برای حذف کنسلی‌ها حاضر به پرداخت اشتراک ماهانه پنل مدیریت هستند.', testMethod: 'مصاحبه با ۲ مدیر مرکز در یزد', status: 'validated' }
        ],
        prototypePlan: 'ماکاپ تعاملی انتخاب خدمت، مشاهده تقویم اسلات‌های آزاد/تخفیف‌دار و ثبت در لیست انتظار خودکار.',
        coCreationFeedback: 'مراکز خدماتی تأکید داشتند امکان تعریف «مدت‌زمان متفاوت برای هر نوع خدمت» (مثلاً ۲۰ یا ۴۵ دقیقه) ضروری است.',
        pivotMade: 'تقویم ثابت ۳۰ دقیقه‌ای به موتور اسلات پویا بر اساس نوع خدمت تغییر یافت.',
        mvpScope: 'جستجوی مرکز، رزرو اسلات با کنترل تداخل، ثبت در صف انتظار و جابه‌جایی خودکار پس از لغو نوبت.',
        successMetric: 'حذف کامل تداخل دوگانه نوبت‌ها و پر شدن حداقل ۷۰٪ نوبت‌های لغوشده از صف انتظار.',
        valueStatement: 'پلتفرم نوبت‌دهی هوشمند برای مراجعان و مراکز خدماتی که با تداخل نوبت و زیان کنسلی روبه‌رو هستند، با قفل موقت اسلات زمانی و جایگزینی خودکار از لیست انتظار، رزروی شفاف و بدون ظرفیت سوخته ایجاد می‌کند.'
      },
      radar: {
        scores: [9, 8, 8, 8, 8, 9, 8, 7],
        ideaType: 'تطبیقی (Adaptive)',
        evidence: [
          'بررسی ۱۰ مرکز خدماتی که نوبت‌دهی دفتری یا تلفنی دارند',
          'اتلاف وقت روزانه منشی و مراجعان در جابه‌جایی تلفنی نوبت‌ها',
          'بومی‌سازی الگوی مدیریت ظرفیت زمانی با لیست انتظار خودکار',
          'قابلیت گسترش به اصناف مشاوره، خدمات فنی، آموزشی و کلینیکی',
          'کارمزد به ازای هر نوبت قطعی یا اشتراک ماهانه پنل مدیریت مرکز',
          'امکان تست مستقیم با ۲ مرکز خدماتی در شهر یزد',
          'اعمال قوانین جریمه لغو دیرهنگام در محیط Sandbox',
          'وضعیت فعلی: تماس تلفنی در ساعات محدود اداری'
        ]
      },
      bmc: {
        kp: ['مراکز و متخصصان ارائه‌دهنده خدمت', 'درگاه آزمایشی بیعانه', 'سرویس اعلان شبیه‌سازی‌شده'],
        ka: ['مدیریت تقویم بدون تداخل', 'احراز صلاحیت مراکز', 'پردازش خودکار لیست انتظار'],
        kr: ['موتور تخصیص اسلات زمانی', 'بانک دیدگاه‌های مراجعان واقعی'],
        vp: ['رزرو آنی شبانه‌روزی با تعرفه شفاف', 'جبران خودکار نوبت‌های لغوشده برای مراکز'],
        cr: ['یادآور زمان مراجعه', 'پشتیبانی جابه‌جایی نوبت طبق ضابطه'],
        ch: ['جستجوی محلی وب (Local SEO)', 'رابط موبایل‌محور سریع'],
        cs: ['مراجعان خدمات تخصصی', 'مراکز خدماتی دارای ظرفیت زمانی محدود'],
        cost: ['نگهداری سرور و پایگاه داده تقویم', 'جذب مراکز اولیه'],
        rev: ['کارمزد هر رزرو موفق', 'اشتراک ماهانه پنل پیشرفته مراکز']
      },
      aida: { a: 14000, i: 52, d: 38, act: 24, rev: 120000, spend: 16000000 },
      scenarios: [
        createScenarioTemplate(1, {
          id: 'SC-01',
          role: 'مراجعه‌کننده',
          title: 'انتخاب بازه زمانی با بررسی تداخل و قفل موقت اسلات',
          goal: 'جلوگیری از رزرو هم‌زمان یک ساعت مشخص توسط دو کاربر'
        }),
        createScenarioTemplate(2, {
          id: 'SC-02',
          role: 'مدیر مرکز',
          title: 'لغو نوبت و جایگزینی خودکار از صف انتظار بر اساس اولویت',
          goal: 'جلوگیری از سوخت شدن ظرفیت زمانی مرکز'
        })
      ]
    },
    c2c: {
      meta: {
        title: 'پلتفرم اشتراک و اجاره ابزارهای تخصصی و آزمایشگاهی',
        student: 'دانشجوی مهندسی کامپیوتر — دانشگاه یزد',
        domain: 'اقتصاد اشتراکی (Access over Ownership)'
      },
      liedtka: {
        visualization: 'نمایش چرخه امانت‌سپاری امن تجهیز: انتخاب بازه روزانه ← مسدودسازی ودیعه امانی ← ثبت چک‌لیست سلامت تحویل و بازگشت.',
        persona: 'دانشجویان مهندسی، عکاسان و تیم‌های فنی نیازمند تجهیزات گران‌قیمت برای مصرف چندروزه',
        journeySteps: [
          { id: 1, step: 'نیاز به ابزار تخصصی یا اندازه‌گیری برای یک پروژه ۳ روزه', pain: 'قیمت خرید بسیار سنگین تجهیز برای استفاده کوتاه‌مدت' },
          { id: 2, step: 'پرس‌وجو در گروه‌های دانشجویی برای قرض گرفتن ابزار', pain: 'نبود اعتماد متقابل و نگرانی مالک از آسیب دیدن دستگاه' }
        ],
        valueChainActors: 'مالکان ابزارهای کم‌مصرف ← واسطه‌های سنتی کرایه ابزار ← دانشجویان و مجریان پروژه',
        valueChainLeakage: 'بیش از ۷۰٪ زمان ماه، تجهیزات تخصصی شخصی بدون استفاده راکد می‌مانند در حالی که متقاضیان به دلیل نبود سازوکار تضمین سلامت به آن دسترسی ندارند.',
        mindMapClusters: ['راکد ماندن دارایی گران‌قیمت', 'ترس مالک از خسارت احتمالی', 'هزینه غیرمنطقی خرید قطعی برای مصرف کوتاه'],
        designCriteria: 'راه‌حل باید دسترسی روزانه با نرخ پلکانی فراهم کند و ریسک خسارت مالک را با ودیعه امانی و صورت‌جلسه سلامت پوشش دهد.',
        whatIfs: [
          { id: 301, text: 'چه می‌شود اگر به جای خرید ابزار، اجاره روزانه با مسدودسازی ودیعه در حساب امانی Sandbox انجام شود؟', lens: 'دسترسی به‌جای مالکیت', status: 'shortlisted' },
          { id: 302, text: 'چه می‌شود اگر هنگام تحویل و بازگشت، چک‌لیست دیجیتال سلامت دستگاه توسط دو طرف تایید شود؟', lens: 'بازنگری مبادله', status: 'shortlisted' },
          { id: 303, text: 'چه می‌شود اگر کاربران خوش‌حساب در اجاره‌های بعدی ودیعه کمتری بپردازند؟', lens: 'تفکر قیاسی', status: 'active' }
        ],
        concepts: [
          {
            id: 311,
            title: 'بازارگاه امانت‌سپاری تجهیزات با ودیعه امانی و چک‌لیست سلامت دوطرفه',
            mechanism: 'تقویم اجاره پلکانی + قفل ودیعه در Sandbox + صورت‌جلسه دیجیتال تحویل و استرداد',
            edge: 'قفل اعتماد میان مالک و اجاره‌گیرنده را بدون نیاز به خرید دارایی توسط پلتفرم باز می‌کند.',
            selected: true
          }
        ],
        assumptions: [
          { id: 321, category: 'مطلوبیت مشتری', text: 'مالکان تجهیزات راکد با وجود ودیعه تضمین‌شده حاضر به اجاره دادن دستگاه خود هستند.', testMethod: 'مصاحبه با ۸ دانشجو و فارغ‌التحصیل دارای تجهیزات عکاسی و الکترونیک', status: 'validated' }
        ],
        prototypePlan: 'وایرفریم صفحه تجهیز شامل ماشین‌حساب کرایه پلکانی + مبلغ ودیعه + فرم چک‌لیست سلامت تحویل.',
        coCreationFeedback: 'مالکان پیشنهاد دادند امکان تعیین «حداقل امتیاز اعتبار اجاره‌گیرنده» برای ابزارهای بسیار حساس وجود داشته باشد.',
        pivotMade: 'سطح‌بندی تجهیزات به عادی و حساس و افزودن شرط احراز هویت تکمیلی برای تجهیزات حساس.',
        mvpScope: 'ثبت تجهیز توسط مالک، محاسبه کرایه پلکانی و ودیعه بر اساس بازه تاریخ، و ثبت چک‌لیست تحویل/بازگشت.',
        successMetric: 'تکمیل بدون اختلاف چرخه رزرو تا آزادسازی ودیعه در سناریوهای آزمون.',
        valueStatement: 'سامانه اجاره اشتراکی برای تیم‌ها و دانشجویانی که برای چند روز به ابزار تخصصی گران‌قیمت نیاز دارند، با مسدودسازی ودیعه امانی و ثبت چک‌لیست سلامت دوطرفه، دسترسی امن و کم‌هزینه بدون نیاز به خرید فراهم می‌سازد.'
      },
      radar: {
        scores: [8, 9, 8, 7, 8, 8, 8, 8],
        ideaType: 'تطبیقی (Adaptive)',
        evidence: [
          'نیاز پرتکرار دانشجویان مهندسی، معماری و رسانه به ابزارهای پروژه‌ای',
          'بیش از ۶۰ درصد تجهیزات شخصی در طول ماه بدون استفاده باقی می‌مانند',
          'جایگزینی مالکیت پرهزینه با دسترسی تضمین‌شده زمانی',
          'امکان شروع از محیط دانشگاهی و گسترش به سطح شهر',
          'دریافت کمیسیون از مبلغ اجاره روزانه و بسته پوشش خسارت',
          'آزمون‌پذیری سریع میان دانشجویان دانشکده‌های فنی و هنر',
          'سازوکار داوری اختلاف بر پایه چک‌لیست ثبت‌شده زمان تحویل',
          'وضعیت فعلی: قرض گرفتن غیررسمی یا خرید پرهزینه ابزار نو/دست‌دوم'
        ]
      },
      bmc: {
        kp: ['مالکان ابزارها و تجهیزات', 'کارگاه‌های فنی همکار جهت کارشناسی سلامت', 'درگاه آزمایشی ودیعه امانی'],
        ka: ['احراز هویت دوطرفه', 'مدیریت تقویم امانت و محاسبه ودیعه', 'ثبت چک‌لیست سلامت تحویل و بازگشت'],
        kr: ['کاتالوگ تجهیزات با نرخ پلکانی', 'شاخص اعتبار امانت‌داری کاربران'],
        vp: ['دسترسی کم‌هزینه بدون خرید دارایی', 'درآمدزایی امن از تجهیزات بدون استفاده'],
        cr: ['فرآیند شفاف تحویل و تسویه ودیعه', 'پشتیبانی حل اختلاف خسارت'],
        ch: ['وب‌اپلیکیشن مبتنی بر موقعیت محلی', 'انجمن‌ها و کانال‌های تخصصی دانشجویی'],
        cs: ['متقاضیان اجاره کوتاه‌مدت ابزار', 'مالکان تجهیزات کم‌مصرف'],
        cost: ['توسعه سامانه رزرو و اعتبارسنجی', 'پشتیبانی و داوری سفارش‌ها'],
        rev: ['کارمزد درصدی از هر اجاره موفق', 'هزینه بسته تضمین سلامت تجهیز']
      },
      aida: { a: 8500, i: 48, d: 34, act: 22, rev: 180000, spend: 10000000 },
      scenarios: [
        createScenarioTemplate(1, {
          id: 'SC-01',
          role: 'اجاره‌گیرنده',
          title: 'محاسبه کرایه پلکانی بر اساس تعداد روز + محاسبه ودیعه و ثبت رزرو',
          goal: 'شفافیت کامل هزینه اجاره و جلوگیری از تداخل تقویم ابزار'
        })
      ]
    },
    blank: {
      meta: {
        title: '',
        student: '',
        domain: ''
      },
      liedtka: {
        visualization: '',
        persona: '',
        journeySteps: [],
        valueChainActors: '',
        valueChainLeakage: '',
        mindMapClusters: [],
        designCriteria: '',
        whatIfs: [],
        concepts: [],
        assumptions: [],
        prototypePlan: '',
        coCreationFeedback: '',
        pivotMade: '',
        mvpScope: '',
        successMetric: '',
        valueStatement: ''
      },
      radar: {
        scores: [5, 5, 5, 5, 5, 5, 5, 5],
        ideaType: 'ترکیبی (Combination)',
        evidence: ['', '', '', '', '', '', '', '']
      },
      bmc: {
        kp: [],
        ka: [],
        kr: [],
        vp: [],
        cr: [],
        ch: [],
        cs: [],
        cost: [],
        rev: []
      },
      aida: { a: 10000, i: 40, d: 30, act: 15, rev: 200000, spend: 12000000 },
      scenarios: [createScenarioTemplate(1)],
      readme: {
        repoUrl: '',
        liveUrl: '',
        stack: '',
        setup: 'git clone <repo-url>\nnpm install\nnpm run dev',
        env: 'VITE_APP_MODE=sandbox',
        accounts: 'کاربر آزمایشی: user@example.com / 123456\nمدیر سامانه: admin@example.com / 123456'
      },
      ai: {
        tools: '',
        tier: 'رایگان',
        strategy: '',
        architecture: '',
        debugLog: ''
      },
      rubric: {
        scores: [0.9, 0.9, 0.9, 1.3, 1.0, 1.0, 0.0],
        phases: [true, true, true],
        date: '',
        time: '14:00',
        audit: [false, false, false, false, false, false]
      }
    }
  };

  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadStudioState() {
    const base = cloneData(PRESETS.b2b);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      return {
        meta: { ...base.meta, ...(parsed.meta || {}) },
        liedtka: { ...base.liedtka, ...(parsed.liedtka || {}) },
        radar: { ...base.radar, ...(parsed.radar || {}) },
        bmc: { ...base.bmc, ...(parsed.bmc || {}) },
        aida: { ...base.aida, ...(parsed.aida || {}) },
        scenarios: Array.isArray(parsed.scenarios) && parsed.scenarios.length ? parsed.scenarios : base.scenarios,
        readme: { ...base.readme, ...(parsed.readme || {}) },
        ai: { ...base.ai, ...(parsed.ai || {}) },
        rubric: { ...base.rubric, ...(parsed.rubric || {}) }
      };
    } catch {
      return base;
    }
  }

  let studioState = loadStudioState();
  const rerenderCallbacks = [];

  function saveStudioState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studioState));
    } catch {
      // محدودیت حافظه مرورگر
    }
    updateDockTelemetryAndBento();
  }

  function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    const fresh = cloneData(preset);
    studioState = {
      ...cloneData(PRESETS.blank),
      ...fresh,
      readme: fresh.readme || cloneData(PRESETS.b2b.readme),
      ai: fresh.ai || cloneData(PRESETS.b2b.ai),
      rubric: fresh.rubric || cloneData(PRESETS.b2b.rubric)
    };
    saveStudioState();
    rerenderCallbacks.forEach((fn) => fn());
    updateDockTelemetryAndBento();
    if (window.spatialAudio) window.spatialAudio.playSuccess();
    const names = {
      blank: 'بوم خام برای پروژه شخصی شما آماده شد.',
      b2b: 'نمونه بازارگاه B2B صنعتی بارگذاری شد.',
      b2c: 'نمونه رزرواسیون خدمات B2C بارگذاری شد.',
      c2c: 'نمونه پلتفرم اقتصاد اشتراکی بارگذاری شد.'
    };
    showToast(names[presetKey] || 'الگو بارگذاری شد.', 'success');
  }

  /* ==========================================================================
     محاسبه زنده وضعیت پیشرفت برای «داک کپسولی شناور» و «ویترین کلان Bento»
     ========================================================================== */
  function computeToolsTelemetry() {
    const L = studioState.liedtka || {};
    const liedtkaChecks = [
      Boolean(L.visualization && L.visualization.trim().length > 5),
      Boolean((L.persona && L.persona.trim()) || (L.journeySteps && L.journeySteps.length > 0)),
      Boolean((L.valueChainActors && L.valueChainActors.trim()) || (L.valueChainLeakage && L.valueChainLeakage.trim())),
      Boolean((L.mindMapClusters && L.mindMapClusters.length > 0) || (L.designCriteria && L.designCriteria.trim())),
      Boolean(L.whatIfs && L.whatIfs.length > 0),
      Boolean(L.concepts && L.concepts.length > 0),
      Boolean(L.assumptions && L.assumptions.length > 0),
      Boolean(L.prototypePlan && L.prototypePlan.trim().length > 5),
      Boolean((L.coCreationFeedback && L.coCreationFeedback.trim()) || (L.pivotMade && L.pivotMade.trim())),
      Boolean((L.mvpScope && L.mvpScope.trim()) || (L.valueStatement && L.valueStatement.trim()))
    ];
    const liedtkaDone = liedtkaChecks.filter(Boolean).length;

    const rScores = studioState.radar?.scores || [7, 7, 7, 7, 7, 7, 7, 7];
    const radarPct = Math.round((rScores.reduce((a, b) => a + b, 0) / 80) * 100);

    const bmcKeys = ['kp', 'ka', 'kr', 'vp', 'cr', 'ch', 'cs', 'cost', 'rev'];
    const bmcFilled = bmcKeys.filter((k) => (studioState.bmc?.[k] || []).length > 0).length;

    const f = studioState.aida || { a: 10000, i: 45, d: 30, act: 20, rev: 250000, spend: 15000000 };
    const interested = Math.round(f.a * (f.i / 100));
    const desired = Math.round(interested * (f.d / 100));
    const customers = Math.max(1, Math.round(desired * (f.act / 100)));
    const cac = Math.round(f.spend / customers);

    const scCount = (studioState.scenarios || []).length;

    const rub = studioState.rubric || { scores: [0.9, 0.9, 0.9, 1.3, 1.0, 1.0, 0.5], phases: [true, true, true] };
    const rawBase = (rub.scores || []).slice(0, 6).reduce((a, b) => a + Number(b), 0);
    const bonus = Number(rub.scores?.[6] || 0);
    const missed = (rub.phases || [true, true, true]).filter((x) => !x).length;
    const finalGrade = Math.min(rawBase, 6 - missed * 0.5) + bonus;

    return {
      liedtka: { pct: (liedtkaDone / 10) * 100, label: `${liedtkaDone.toLocaleString('fa-IR')}/۱۰ ابزار`, doneCount: liedtkaDone, checks: liedtkaChecks },
      radar: { pct: radarPct, label: `${radarPct.toLocaleString('fa-IR')}٪ بلوغ`, scores: rScores },
      bmc: { pct: (bmcFilled / 9) * 100, label: `${bmcFilled.toLocaleString('fa-IR')}/۹ بخش`, filled: bmcFilled },
      funnel: { pct: Math.min(100, Math.max(20, f.i)), label: `${customers.toLocaleString('fa-IR')} مشتری`, customers, cac, f },
      bdd: { pct: Math.min(100, (scCount / 10) * 100), label: `${scCount.toLocaleString('fa-IR')}/۱۰ سناریو`, scCount },
      rubric: { pct: Math.min(100, (finalGrade / 7) * 100), label: `${finalGrade.toFixed(2)} نمره`, finalGrade }
    };
  }

  function updateDockTelemetryAndBento() {
    const t = computeToolsTelemetry();
    const circumference = 2 * Math.PI * 11; // r = 11 -> ~69.1

    Object.entries(t).forEach(([key, info]) => {
      document.querySelectorAll(`[data-dock-metric="${key}"]`).forEach((el) => {
        el.textContent = info.label;
      });
      document.querySelectorAll(`[data-dock-ring="${key}"]`).forEach((circle) => {
        const offset = circumference * (1 - Math.min(1, Math.max(0, info.pct / 100)));
        circle.setAttribute('stroke-dasharray', circumference.toFixed(1));
        circle.setAttribute('stroke-dashoffset', offset.toFixed(1));
      });
    });

    const bentoGrid = document.getElementById('studio-bento-grid');
    if (!bentoGrid) return;

    const L = studioState.liedtka || {};
    const bmcKeys = ['kp', 'ka', 'kr', 'vp', 'cr', 'ch', 'cs', 'cost', 'rev'];
    const bmcMiniCells = bmcKeys
      .map((k) => {
        const has = (studioState.bmc?.[k] || []).length > 0;
        return `<span class="h-3 rounded-sm" style="background:${has ? 'var(--accent)' : 'var(--bg-muted)'};opacity:${has ? '0.85' : '0.6'}"></span>`;
      })
      .join('');

    bentoGrid.innerHTML = `
      <!-- کارت ۱: تفکر طراحی لیدکا (عریض) -->
      <button type="button" data-open-tool="liedtka" class="bento-tool-card bento-span-4">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-light" style="color:var(--ink-3)">۰۱ · کشف مسئله تا تثبیت مفهوم</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full surface-well" style="color:var(--accent)">${t.liedtka.label}</span>
        </div>
        <div class="w-full space-y-2">
          <div class="text-base font-bold">مدل تفکر طراحی جین لیدکا (۴ موج و ۱۰ ابزار)</div>
          <svg viewBox="0 0 360 64" class="w-full h-12" dir="ltr">
            <path d="M 8 44 C 34 16, 76 16, 102 44 C 132 4, 182 4, 212 44 C 236 18, 274 18, 298 44 C 316 28, 338 28, 352 44" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M 8 44 C 34 60, 76 60, 102 44 C 132 60, 182 60, 212 44 C 236 60, 274 60, 298 44 C 316 56, 338 56, 352 44" fill="none" stroke="var(--ink-3)" stroke-width="1.5" stroke-opacity="0.55" stroke-linecap="round"/>
          </svg>
          <p class="type-caption text-xs line-clamp-1 m-0">${escapeHtml(L.valueStatement || 'برای شروع فرآیند ۱۰ گانه ایده‌پردازی کلیک کنید...')}</p>
        </div>
      </button>

      <!-- کارت ۲: رادار ۸ معیار -->
      <button type="button" data-open-tool="radar" class="bento-tool-card bento-span-2">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-light" style="color:var(--ink-3)">۰۲ · تفکر همگرا</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full surface-well" style="color:var(--accent)">${t.radar.label}</span>
        </div>
        <div class="w-full space-y-1.5">
          <div class="text-base font-bold">رادار ۸ معیار ایده بالغ</div>
          <div class="text-xs font-normal" style="color:var(--ink-2)">طبقه ایده: ${escapeHtml(studioState.radar?.ideaType || 'ترکیبی')}</div>
        </div>
      </button>

      <!-- کارت ۳: بوم مدل کسب‌وکار -->
      <button type="button" data-open-tool="bmc" class="bento-tool-card bento-span-2">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-light" style="color:var(--ink-3)">۰۳ · معماری فاز ۲</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full surface-well" style="color:var(--accent)">${t.bmc.label}</span>
        </div>
        <div class="w-full space-y-2.5">
          <div class="text-base font-bold">بوم مدل کسب‌وکار (BMC)</div>
          <div class="grid grid-cols-5 gap-1 w-full">${bmcMiniCells}</div>
        </div>
      </button>

      <!-- کارت ۴: قیف AIDA -->
      <button type="button" data-open-tool="funnel" class="bento-tool-card bento-span-2">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-light" style="color:var(--ink-3)">۰۴ · بازاریابی فاز ۳</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full surface-well" style="color:var(--accent)">${t.funnel.label}</span>
        </div>
        <div class="w-full space-y-2">
          <div class="text-base font-bold">شبیه‌ساز سه‌بعدی قیف AIDA</div>
          <div class="text-xs font-normal" style="color:var(--ink-2)">CAC: ${t.funnel.cac.toLocaleString('fa-IR')} تومان</div>
        </div>
      </button>

      <!-- کارت ۵: سناریوها و گیت -->
      <button type="button" data-open-tool="bdd" class="bento-tool-card bento-span-2">
        <div class="w-full flex items-center justify-between gap-2">
          <span class="text-xs font-light" style="color:var(--ink-3)">۰۵ · مهندسی MVP</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full surface-well" style="color:var(--accent)">${t.bdd.label}</span>
        </div>
        <div class="w-full space-y-1.5">
          <div class="text-base font-bold">سناریوهای BDD و اسناد گیت</div>
          <div class="text-xs font-normal" style="color:var(--ink-2)">مولد خودکار README و AI_DISCLOSURE</div>
        </div>
      </button>

      <!-- کارت ۶: شبیه‌ساز نمره و فریز -->
      <button type="button" data-open-tool="rubric" class="bento-tool-card bento-span-6">
        <div class="w-full flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-0.5">
            <div class="text-xs font-light" style="color:var(--ink-3)">۰۶ · ارزیابی و کنترل پیش از دفاع</div>
            <div class="text-base font-bold">شبیه‌ساز بارم ۶+۱، جریمه مایلستون و زمان‌سنج فریز ۴ ساعته کد</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium px-3 py-1 rounded-full surface-well">نوبت دفاع: ${escapeHtml(studioState.rubric?.time || '14:00')}</span>
            <span class="text-sm font-bold px-3.5 py-1 rounded-full" style="background:var(--accent-soft);color:var(--accent)">${t.rubric.finalGrade.toFixed(2)} از ۷٫۰۰ نمره</span>
          </div>
        </div>
      </button>
    `;

    bentoGrid.querySelectorAll('[data-open-tool]').forEach((card) => {
      card.addEventListener('click', () => {
        window.activateStudioTool?.(card.getAttribute('data-open-tool'), { scroll: false });
        if (window.spatialAudio) window.spatialAudio.playClick(600, 0.035);
      });
    });
  }

  /* ==========================================================================
     مدیریت داک کپسولی شناور ۶ ابزار کمکی پروژه + ویترین Bento
     ========================================================================== */
  function initStudioTabs() {
    const tabButtons = document.querySelectorAll('[data-studio-tab]');
    const panels = document.querySelectorAll('[data-studio-panel]');
    if (!tabButtons.length || !panels.length) return;

    function setActiveTool(toolKey, options = {}) {
      let matched = false;
      tabButtons.forEach((btn) => {
        const active = btn.getAttribute('data-studio-tab') === toolKey;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        if (active) matched = true;
      });

      if (!matched) return;

      panels.forEach((panel) => {
        const active = panel.getAttribute('data-studio-panel') === toolKey;
        panel.classList.toggle('is-active', active);
      });

      const stageBox = document.getElementById('studio-active-stage');
      if (stageBox) {
        stageBox.classList.toggle('is-hidden', toolKey === 'overview');
      }

      if (toolKey === 'overview') {
        updateDockTelemetryAndBento();
      }

      if (toolKey === 'funnel') {
        requestAnimationFrame(() => {
          if (window.portalThree) {
            window.portalThree.funnelVisible = true;
            window.portalThree.resizeAll();
          }
        });
      } else if (window.portalThree) {
        window.portalThree.funnelVisible = false;
      }

      if (options.scroll) {
        const studioEl = document.getElementById('project-studio');
        if (studioEl) {
          studioEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      if (options.engSubTab) {
        const targetMap = {
          scenarios: 'eng-panel-scenarios',
          readme: 'eng-panel-readme',
          ai: 'eng-panel-ai'
        };
        const subEl = document.getElementById(targetMap[options.engSubTab] || '');
        if (subEl) {
          if (subEl.tagName === 'DETAILS') subEl.open = true;
          setTimeout(() => {
            subEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            subEl.classList.remove('flash-focus');
            void subEl.offsetWidth;
            subEl.classList.add('flash-focus');
          }, 120);
        }
      }
    }

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setActiveTool(btn.getAttribute('data-studio-tab'), { scroll: false });
        if (window.spatialAudio) window.spatialAudio.playClick(560, 0.035);
      });
    });

    window.activateStudioTool = setActiveTool;
    updateDockTelemetryAndBento();

    const params = new URLSearchParams(window.location.search);
    const initialTool = params.get('tool');
    const initialSub = params.get('sub');
    if (initialTool) {
      setActiveTool(initialTool, { scroll: false, engSubTab: initialSub || undefined });
    }
  }

  /* ==========================================================================
     نوار مشخصات پروژه دانشجو و پشتیبان‌گیری یکپارچه
     ========================================================================== */
  function initStudioProjectBar() {
    const titleInp = document.getElementById('studio-project-title');
    const studentInp = document.getElementById('studio-student-name');
    const domainInp = document.getElementById('studio-domain');
    const exportAllBtn = document.getElementById('studio-export-all-md');
    const exportJsonBtn = document.getElementById('studio-export-json');
    const importJsonBtn = document.getElementById('studio-import-json-btn');
    const importJsonInp = document.getElementById('studio-import-json-input');

    function syncMeta() {
      if (titleInp) titleInp.value = studioState.meta.title || '';
      if (studentInp) studentInp.value = studioState.meta.student || '';
      if (domainInp) domainInp.value = studioState.meta.domain || '';
    }
    rerenderCallbacks.push(syncMeta);
    syncMeta();

    titleInp?.addEventListener('input', () => {
      studioState.meta.title = titleInp.value;
      saveStudioState();
    });
    studentInp?.addEventListener('input', () => {
      studioState.meta.student = studentInp.value;
      saveStudioState();
    });
    domainInp?.addEventListener('input', () => {
      studioState.meta.domain = domainInp.value;
      saveStudioState();
    });

    document.querySelectorAll('[data-load-preset]').forEach((btn) => {
      btn.addEventListener('click', () => applyPreset(btn.getAttribute('data-load-preset')));
    });

    exportAllBtn?.addEventListener('click', () => {
      downloadFile('ANALYTICAL_DOSSIER_DRAFT.md', buildMasterDossierMarkdown());
    });

    exportJsonBtn?.addEventListener('click', () => {
      downloadFile('yazd-ec-project-tools.json', JSON.stringify(studioState, null, 2), 'application/json;charset=utf-8');
    });

    importJsonBtn?.addEventListener('click', () => importJsonInp?.click());
    importJsonInp?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed.meta || !parsed.bmc) throw new Error('Invalid');
          studioState = { ...cloneData(PRESETS.blank), ...parsed };
          saveStudioState();
          rerenderCallbacks.forEach((fn) => fn());
          showToast('اطلاعات ابزارهای کمکی پروژه بازیابی شد.', 'success');
        } catch {
          showToast('ساختار فایل JSON معتبر نیست.', 'error');
        }
      };
      reader.readAsText(file);
      importJsonInp.value = '';
    });
  }

  /* ==========================================================================
     ابزار ۰۱: مدل تفکر طراحی در کسب‌وکار جین لیدکا (Jeanne Liedtka)
     کلیک روی هر شماره (۱ تا ۱۰) یا هر موج، پنجره اختصاصی (Popup) همان ابزار را باز می‌کند
     ========================================================================== */
  function initLiedtkaWorkshop() {
    const svgEl = document.getElementById('liedtka-wave-svg');
    if (!svgEl) return;

    const finalVpInput = document.getElementById('liedtka-final-vp');
    const autoSynthBtn = document.getElementById('liedtka-synth-vp-btn');
    const copyMdBtn = document.getElementById('liedtka-copy-md-btn');
    const resetBtn = document.getElementById('liedtka-reset-btn');
    const progressBadge = document.getElementById('liedtka-progress-badge');

    let activePopupToolNum = null;

    // ساخت پوپ‌آپ یکپارچه برای نمایش ابزارهای ۱ تا ۱۰ لیدکا
    let modalBackdrop = document.getElementById('liedtka-tool-modal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'liedtka-tool-modal';
      modalBackdrop.className = 'liedtka-modal-backdrop is-hidden';
      modalBackdrop.setAttribute('role', 'dialog');
      modalBackdrop.setAttribute('aria-modal', 'true');
      modalBackdrop.innerHTML = `
        <div class="liedtka-modal-dialog" dir="rtl">
          <div class="px-6 py-4 hairline-b flex items-start justify-between gap-4" style="background:var(--bg-subtle)">
            <div class="flex items-start gap-3">
              <span id="lmodal-badge" class="liedtka-pin-badge mt-0.5">۱</span>
              <div class="space-y-0.5">
                <div id="lmodal-stage" class="type-kicker"></div>
                <h4 id="lmodal-title" class="text-sm md:text-base font-bold m-0"></h4>
              </div>
            </div>
            <button type="button" id="lmodal-close-x" class="btn-quiet py-1 px-2.5 text-xs font-mono" title="بستن (Esc)">✕</button>
          </div>
          <div id="lmodal-body" class="p-6 overflow-y-auto space-y-4 flex-1"></div>
          <div class="px-6 py-3.5 hairline-t flex flex-wrap items-center justify-between gap-2" style="background:var(--bg-subtle)">
            <div class="flex items-center gap-2">
              <button type="button" id="lmodal-prev-btn" class="btn-quiet py-1.5 px-3 text-xs">→ ابزار قبلی</button>
              <button type="button" id="lmodal-next-btn" class="btn-quiet py-1.5 px-3 text-xs">ابزار بعدی ←</button>
            </div>
            <button type="button" id="lmodal-done-btn" class="btn-solid py-1.5 px-4 text-xs">ثبت و بستن</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalBackdrop);
    }

    const modalBadge = modalBackdrop.querySelector('#lmodal-badge');
    const modalStage = modalBackdrop.querySelector('#lmodal-stage');
    const modalTitle = modalBackdrop.querySelector('#lmodal-title');
    const modalBody = modalBackdrop.querySelector('#lmodal-body');
    const modalCloseX = modalBackdrop.querySelector('#lmodal-close-x');
    const modalDoneBtn = modalBackdrop.querySelector('#lmodal-done-btn');
    const modalPrevBtn = modalBackdrop.querySelector('#lmodal-prev-btn');
    const modalNextBtn = modalBackdrop.querySelector('#lmodal-next-btn');

    const TOOL_META = {
      1: { stageId: 'vis', stageLabel: 'چتر سراسری کل فرآیند (از ابتدا تا انتها)', title: 'بصری‌سازی (Visualization)' },
      2: { stageId: 'what-is', stageLabel: 'مرحله اول: چه هست؟ (What is?) — واگرایی در مشاهده', title: 'ترسیم نقشه سفر فعلی مشتری (Journey Mapping)' },
      3: { stageId: 'what-is', stageLabel: 'مرحله اول: چه هست؟ (What is?) — تحلیل بازار موجود', title: 'تحلیل زنجیره ارزش (Value Chain Analysis)' },
      4: { stageId: 'what-is', stageLabel: 'مرحله اول: چه هست؟ (What is?) — گره همگرایی اول', title: 'نگاشت ذهنی و معیارهای طراحی (Mind Mapping)' },
      5: { stageId: 'what-if', stageLabel: 'مرحله دوم: چه می‌شود اگر؟ (What if?) — اوج واگرایی خلاقانه', title: 'طوفان فکری ساختاریافته (Brainstorming)' },
      6: { stageId: 'what-if', stageLabel: 'مرحله دوم: چه می‌شود اگر؟ (What if?) — گره همگرایی دوم', title: 'توسعه مفهوم محصول (Concept Development)' },
      7: { stageId: 'what-wows', stageLabel: 'مرحله سوم: چه شگفت‌زده می‌کند؟ (What wows?) — پالایش ریسک‌ها', title: 'آزمون فرضیات کلیدی (Assumption Testing)' },
      8: { stageId: 'what-wows', stageLabel: 'مرحله سوم: چه شگفت‌زده می‌کند؟ (What wows?) — گره همگرایی سوم', title: 'نمونه‌سازی سریع (Rapid Prototyping)' },
      9: { stageId: 'what-works', stageLabel: 'مرحله چهارم: چه کار می‌کند؟ (What works?) — مواجهه با بازار واقعی', title: 'هم‌آفرینی با مشتری (Customer Co-Creation)' },
      10: { stageId: 'what-works', stageLabel: 'مرحله چهارم: چه کار می‌کند؟ (What works?) — همگرایی نهایی در MVP', title: 'راه‌اندازی یادگیرنده (Learning Launch)' }
    };

    function getToolCompletionMap() {
      const L = studioState.liedtka || {};
      return {
        1: Boolean(L.visualization && L.visualization.trim().length > 5),
        2: Boolean((L.persona && L.persona.trim()) || (L.journeySteps && L.journeySteps.length > 0)),
        3: Boolean((L.valueChainActors && L.valueChainActors.trim()) || (L.valueChainLeakage && L.valueChainLeakage.trim())),
        4: Boolean((L.mindMapClusters && L.mindMapClusters.length > 0) || (L.designCriteria && L.designCriteria.trim())),
        5: Boolean(L.whatIfs && L.whatIfs.length > 0),
        6: Boolean(L.concepts && L.concepts.length > 0),
        7: Boolean(L.assumptions && L.assumptions.length > 0),
        8: Boolean(L.prototypePlan && L.prototypePlan.trim().length > 5),
        9: Boolean((L.coCreationFeedback && L.coCreationFeedback.trim()) || (L.pivotMade && L.pivotMade.trim())),
        10: Boolean((L.mvpScope && L.mvpScope.trim()) || (L.valueStatement && L.valueStatement.trim()))
      };
    }

    function closeToolPopup() {
      activePopupToolNum = null;
      modalBackdrop.classList.add('is-hidden');
      renderLiedtkaDiagram();
    }

    function openToolPopup(num) {
      const toolNum = Math.max(1, Math.min(10, Number(num) || 1));
      activePopupToolNum = toolNum;
      const meta = TOOL_META[toolNum];

      modalBadge.textContent = toolNum.toLocaleString('fa-IR');
      modalStage.textContent = meta.stageLabel;
      modalTitle.textContent = meta.title;
      modalPrevBtn.disabled = toolNum <= 1;
      modalPrevBtn.style.opacity = toolNum <= 1 ? '0.4' : '1';
      modalNextBtn.disabled = toolNum >= 10;
      modalNextBtn.style.opacity = toolNum >= 10 ? '0.4' : '1';

      renderPopupBody(toolNum);
      modalBackdrop.classList.remove('is-hidden');
      renderLiedtkaDiagram();
      if (window.spatialAudio) window.spatialAudio.playClick(640, 0.035);
    }

    function renderPopupBody(num) {
      const L = studioState.liedtka;

      if (num === 1) {
        modalBody.innerHTML = `
          <p class="type-caption m-0">بصری‌سازی در تمام ۴ مرحله حضور دارد: به جای توصیف انتزاعی، وضعیت قبل و بعد از ورود سامانه خود را به تصویر ملموس یا استوری‌بورد تبدیل کنید.</p>
          <div>
            <label class="block text-xs font-semibold mb-1.5">توصیف سناریوی تصویری «پیش از سامانه» در برابر «پس از سامانه»</label>
            <textarea id="pop-vis-inp" rows="5" class="field-input text-xs md:text-sm" placeholder="مثلاً: در وضعیت قدیم مسئول خرید ۳ ساعت پای تلفن استعلام می‌گیرد؛ در وضعیت جدید در یک صفحه واحد سبد کالا را ثبت و پیش‌فاکتور مقایسه‌ای دریافت می‌کند...">${escapeHtml(
              L.visualization || ''
            )}</textarea>
          </div>
        `;
        modalBody.querySelector('#pop-vis-inp')?.addEventListener('input', (e) => {
          L.visualization = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
      } else if (num === 2) {
        const steps = L.journeySteps || [];
        modalBody.innerHTML = `
          <p class="type-caption m-0">کاربر هدف امروز (بدون سامانه شما) چه مراحلی را طی می‌کند و در هر گام دقیقاً کجا دچار اتلاف زمان، هزینه یا سردرگمی می‌شود؟</p>
          <div>
            <label class="block text-xs font-semibold mb-1">گروه مبتلا‌به / مخاطب هدف اصلی</label>
            <input type="text" id="pop-persona-inp" value="${escapeHtml(L.persona || '')}" placeholder="مثلاً: مسئولان خرید کارگاه‌های تولیدی کوچک و متوسط..." class="field-input text-xs" />
          </div>
          <div class="space-y-2">
            <div class="text-xs font-semibold">گام‌های فعلی مشتری و نقاط درد (Pain Points):</div>
            ${
              steps.length
                ? steps
                    .map(
                      (st, idx) => `
                      <div class="p-3 rounded-lg surface-well text-xs flex items-start justify-between gap-2">
                        <div class="space-y-1">
                          <div class="font-semibold">${(idx + 1).toLocaleString('fa-IR')}. ${escapeHtml(st.step)}</div>
                          <div style="color:var(--danger)">نقطه درد: ${escapeHtml(st.pain)}</div>
                        </div>
                        <button type="button" data-pop-del-jstep="${idx}" class="px-1.5 text-sm opacity-70 hover:opacity-100" style="color:var(--danger)">×</button>
                      </div>
                    `
                    )
                    .join('')
                : `<div class="type-caption py-4 text-center border border-dashed rounded" style="border-color:var(--line-strong)">هنوز گامی از سفر فعلی مشتری ثبت نشده است.</div>`
            }
          </div>
          <form id="pop-add-jstep" class="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-3 hairline-t">
            <input type="text" id="pop-jstep-title" placeholder="گام فعلی مشتری..." class="field-input py-1.5 text-xs sm:col-span-5" />
            <input type="text" id="pop-jstep-pain" placeholder="اصطکاک یا درد ایجادشده..." class="field-input py-1.5 text-xs sm:col-span-5" />
            <button type="submit" class="btn-solid py-1.5 px-2 text-xs sm:col-span-2">+ افزودن</button>
          </form>
        `;
        modalBody.querySelector('#pop-persona-inp')?.addEventListener('input', (e) => {
          L.persona = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-add-jstep')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const sInp = modalBody.querySelector('#pop-jstep-title');
          const pInp = modalBody.querySelector('#pop-jstep-pain');
          if (!sInp?.value.trim()) return;
          if (!Array.isArray(L.journeySteps)) L.journeySteps = [];
          L.journeySteps.push({ id: Date.now(), step: sInp.value.trim(), pain: pInp?.value.trim() || 'اصطکاک فرآیندی' });
          saveStudioState();
          renderPopupBody(2);
          renderLiedtkaDiagram();
        });
        modalBody.querySelectorAll('[data-pop-del-jstep]').forEach((btn) => {
          btn.addEventListener('click', () => {
            L.journeySteps.splice(Number(btn.getAttribute('data-pop-del-jstep')), 1);
            saveStudioState();
            renderPopupBody(2);
            renderLiedtkaDiagram();
          });
        });
      } else if (num === 3) {
        modalBody.innerHTML = `
          <p class="type-caption m-0">بررسی بازیگران موجود در بازار سنتی و شناسایی حلقه‌ای که بدون خلق ارزش واقعی، هزینه مبادله یا عدم تقارن اطلاعات ایجاد کرده است.</p>
          <div>
            <label class="block text-xs font-semibold mb-1">زنجیره بازیگران فعلی بازار</label>
            <input type="text" id="pop-vc-actors" value="${escapeHtml(L.valueChainActors || '')}" placeholder="مثلاً: کارخانه مادر ← عمده‌فروش استانی ← واسطه‌های تلفنی ← کارگاه خرد" class="field-input text-xs" />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">محل دقیق نشت ارزش، گلوگاه هزینه مبادله یا عدم تقارن اطلاعات</label>
            <textarea id="pop-vc-leakage" rows="4" class="field-input text-xs" placeholder="دقیقاً کجای این زنجیره ناکارآمدی رخ می‌دهد که پلتفرم تجارت الکترونیک می‌تواند آن را اصلاح کند؟">${escapeHtml(
              L.valueChainLeakage || ''
            )}</textarea>
          </div>
        `;
        modalBody.querySelector('#pop-vc-actors')?.addEventListener('input', (e) => {
          L.valueChainActors = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-vc-leakage')?.addEventListener('input', (e) => {
          L.valueChainLeakage = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
      } else if (num === 4) {
        const clusters = L.mindMapClusters || [];
        modalBody.innerHTML = `
          <p class="type-caption m-0">گره همگرایی اول: مشاهدات ابزارهای ۲ و ۳ را به الگوهای کلیدی دسته‌بندی کنید و معیارهای طراحی (شرط‌های قطعی راه‌حل مطلوب) را استخراج نمایید.</p>
          <div class="space-y-2">
            <label class="block text-xs font-semibold">خوشه‌ها و الگوهای کشف‌شده از مشاهدات</label>
            <div class="flex flex-wrap gap-1.5">
              ${
                clusters.length
                  ? clusters
                      .map(
                        (c, idx) => `
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded surface-well text-xs">
                          <span>${escapeHtml(c)}</span>
                          <button type="button" data-pop-del-cluster="${idx}" style="color:var(--danger)">×</button>
                        </span>
                      `
                      )
                      .join('')
                  : `<span class="type-caption">الگویی ثبت نشده است.</span>`
              }
            </div>
            <form id="pop-add-cluster" class="flex gap-2 pt-1">
              <input type="text" id="pop-cluster-inp" placeholder="افزودن الگو یا ریشه مشکل..." class="field-input py-1.5 text-xs" />
              <button type="submit" class="btn-quiet py-1.5 px-3 text-xs shrink-0">+ افزودن</button>
            </form>
          </div>
          <div class="pt-2 hairline-t">
            <label class="block text-xs font-semibold mb-1" style="color:var(--accent)">معیارهای طراحی (Design Criteria — راه‌حل ایده‌آل ما حتماً باید...)</label>
            <textarea id="pop-design-criteria" rows="3" class="field-input text-xs" placeholder="راه‌حل نهایی باید چه ویژگی‌هایی را بدون استثنا محقق کند؟">${escapeHtml(
              L.designCriteria || ''
            )}</textarea>
          </div>
        `;
        modalBody.querySelector('#pop-add-cluster')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const cInp = modalBody.querySelector('#pop-cluster-inp');
          if (!cInp?.value.trim()) return;
          if (!Array.isArray(L.mindMapClusters)) L.mindMapClusters = [];
          L.mindMapClusters.push(cInp.value.trim());
          saveStudioState();
          renderPopupBody(4);
          renderLiedtkaDiagram();
        });
        modalBody.querySelectorAll('[data-pop-del-cluster]').forEach((btn) => {
          btn.addEventListener('click', () => {
            L.mindMapClusters.splice(Number(btn.getAttribute('data-pop-del-cluster')), 1);
            saveStudioState();
            renderPopupBody(4);
            renderLiedtkaDiagram();
          });
        });
        modalBody.querySelector('#pop-design-criteria')?.addEventListener('input', (e) => {
          L.designCriteria = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
      } else if (num === 5) {
        const whatIfs = L.whatIfs || [];
        modalBody.innerHTML = `
          ${
            L.designCriteria
              ? `<div class="p-3 rounded-lg surface-well text-xs"><strong style="color:var(--accent)">معیار طراحی (از ابزار ۴):</strong> ${escapeHtml(L.designCriteria)}</div>`
              : ''
          }
          <form id="pop-add-whatif" class="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select id="pop-wi-lens" class="field-input py-1.5 text-xs sm:col-span-4">
              <option value="بازنگری مبادله">لنز: بازنگری مبادله</option>
              <option value="دسترسی به‌جای مالکیت">لنز: دسترسی به‌جای مالکیت</option>
              <option value="زنجیره ارزش">لنز: بازآرایی زنجیره ارزش</option>
              <option value="تفکر قیاسی">لنز: تفکر قیاسی</option>
            </select>
            <input type="text" id="pop-wi-text" placeholder="چه می‌شود اگر..." class="field-input py-1.5 text-xs sm:col-span-6" />
            <button type="submit" class="btn-solid py-1.5 px-2 text-xs sm:col-span-2">+ ثبت ایده</button>
          </form>
          <div class="space-y-2">
            ${
              whatIfs.length
                ? whatIfs
                    .map((w) => {
                      const isShort = w.status === 'shortlisted';
                      const isPruned = w.status === 'pruned';
                      return `
                        <div class="idea-card ${isShort ? 'is-selected' : ''} ${isPruned ? 'is-pruned' : ''} space-y-2">
                          <div class="flex items-start justify-between gap-2">
                            <p class="idea-card-text text-xs leading-relaxed m-0">${escapeHtml(w.text)}</p>
                            <span class="text-[10px] font-light px-1.5 py-0.5 rounded surface-well shrink-0">${escapeHtml(w.lens || 'ایده')}</span>
                          </div>
                          <div class="flex items-center justify-between pt-1.5 hairline-t text-[11px]">
                            <div class="flex items-center gap-1.5">
                              ${
                                !isPruned
                                  ? `<button type="button" data-pop-wi="shortlist" data-id="${w.id}" class="${
                                      isShort ? 'btn-solid py-0.5 px-2 text-[11px]' : 'btn-quiet py-0.5 px-2 text-[11px]'
                                    }">${isShort ? 'منتخب برای ترکیب' : 'انتخاب برای مفهوم'}</button>
                                     <button type="button" data-pop-wi="prune" data-id="${w.id}" class="btn-quiet py-0.5 px-2 text-[11px]">رد کردن</button>`
                                  : `<button type="button" data-pop-wi="restore" data-id="${w.id}" class="btn-quiet py-0.5 px-2 text-[11px]">بازگردانی</button>`
                              }
                            </div>
                            <button type="button" data-pop-wi="delete" data-id="${w.id}" style="color:var(--danger)">حذف</button>
                          </div>
                        </div>
                      `;
                    })
                    .join('')
                : `<div class="type-caption py-6 text-center border border-dashed rounded" style="border-color:var(--line-strong)">سوال‌های جسورانه «چه می‌شود اگر...؟» خود را ثبت کنید.</div>`
            }
          </div>
        `;
        modalBody.querySelector('#pop-add-whatif')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const tInp = modalBody.querySelector('#pop-wi-text');
          const lSel = modalBody.querySelector('#pop-wi-lens');
          if (!tInp?.value.trim()) return;
          if (!Array.isArray(L.whatIfs)) L.whatIfs = [];
          L.whatIfs.unshift({ id: Date.now(), text: tInp.value.trim(), lens: lSel?.value || 'ایده', status: 'active' });
          saveStudioState();
          renderPopupBody(5);
          renderLiedtkaDiagram();
        });
        modalBody.querySelectorAll('[data-pop-wi]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const act = btn.getAttribute('data-pop-wi');
            const id = Number(btn.getAttribute('data-id'));
            const item = (L.whatIfs || []).find((x) => x.id === id);
            if (!item) return;
            if (act === 'shortlist') item.status = item.status === 'shortlisted' ? 'active' : 'shortlisted';
            else if (act === 'prune') item.status = 'pruned';
            else if (act === 'restore') item.status = 'active';
            else if (act === 'delete') L.whatIfs = L.whatIfs.filter((x) => x.id !== id);
            saveStudioState();
            renderPopupBody(5);
            renderLiedtkaDiagram();
          });
        });
      } else if (num === 6) {
        const shortlisted = (L.whatIfs || []).filter((w) => w.status === 'shortlisted');
        const concepts = L.concepts || [];
        modalBody.innerHTML = `
          ${
            shortlisted.length
              ? `<div class="p-3 rounded-lg surface-well text-xs space-y-1">
                  <div class="font-semibold" style="color:var(--accent)">ایده‌های برگزیده از طوفان فکری (ابزار ۵):</div>
                  <ul class="list-disc list-inside m-0 space-y-0.5">${shortlisted.map((s) => `<li>${escapeHtml(s.text)}</li>`).join('')}</ul>
                </div>`
              : ''
          }
          <div class="space-y-2.5">
            ${
              concepts.length
                ? concepts
                    .map(
                      (c) => `
                      <div class="concept-card ${c.selected ? 'is-winner' : ''} space-y-1.5">
                        <div class="flex items-start justify-between gap-2">
                          <div class="text-xs md:text-sm font-bold">${escapeHtml(c.title)}</div>
                          <button type="button" data-pop-del-concept="${c.id}" style="color:var(--danger)">×</button>
                        </div>
                        <div class="text-xs leading-relaxed"><strong>سازوکار خلق ارزش:</strong> ${escapeHtml(c.mechanism)}</div>
                        ${c.edge ? `<div class="type-caption text-[11px]">ارزیابی: ${escapeHtml(c.edge)}</div>` : ''}
                        <div class="pt-1">
                          <button type="button" data-pop-pick-concept="${c.id}" class="${
                            c.selected ? 'btn-solid py-1 px-3 text-xs' : 'btn-quiet py-1 px-3 text-xs'
                          }">${c.selected ? 'مفهوم برگزیده جهت آزمون' : 'انتخاب به عنوان مفهوم اصلی'}</button>
                        </div>
                      </div>
                    `
                    )
                    .join('')
                : `<div class="type-caption py-4 text-center border border-dashed rounded" style="border-color:var(--line-strong)">ایده‌های پراکنده را در قالب ۲ مفهوم کاندید ترکیب کنید و بهترین را برگزینید.</div>`
            }
          </div>
          <form id="pop-add-concept" class="space-y-2 pt-3 hairline-t">
            <input type="text" id="pop-c-title" placeholder="عنوان مفهوم کاندید پلتفرم..." class="field-input py-1.5 text-xs" />
            <input type="text" id="pop-c-mech" placeholder="ترکیب سازوکارها (چگونه کار می‌کند؟)..." class="field-input py-1.5 text-xs" />
            <input type="text" id="pop-c-edge" placeholder="مزیت رقابتی یا محدودیت این مفهوم..." class="field-input py-1.5 text-xs" />
            <button type="submit" class="btn-solid py-1.5 px-3 text-xs">+ ثبت مفهوم کاندید</button>
          </form>
        `;
        modalBody.querySelector('#pop-add-concept')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const tInp = modalBody.querySelector('#pop-c-title');
          const mInp = modalBody.querySelector('#pop-c-mech');
          const eInp = modalBody.querySelector('#pop-c-edge');
          if (!tInp?.value.trim()) return;
          if (!Array.isArray(L.concepts)) L.concepts = [];
          L.concepts.push({
            id: Date.now(),
            title: tInp.value.trim(),
            mechanism: mInp?.value.trim() || '—',
            edge: eInp?.value.trim() || '',
            selected: L.concepts.length === 0
          });
          saveStudioState();
          renderPopupBody(6);
          renderLiedtkaDiagram();
        });
        modalBody.querySelectorAll('[data-pop-pick-concept]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-pop-pick-concept'));
            (L.concepts || []).forEach((c) => {
              c.selected = c.id === id;
            });
            saveStudioState();
            renderPopupBody(6);
            renderLiedtkaDiagram();
          });
        });
        modalBody.querySelectorAll('[data-pop-del-concept]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-pop-del-concept'));
            L.concepts = (L.concepts || []).filter((c) => c.id !== id);
            saveStudioState();
            renderPopupBody(6);
            renderLiedtkaDiagram();
          });
        });
      } else if (num === 7) {
        const assumptions = L.assumptions || [];
        const winner = (L.concepts || []).find((c) => c.selected) || L.concepts?.[0];
        modalBody.innerHTML = `
          ${
            winner
              ? `<div class="p-3 rounded-lg surface-well text-xs"><strong style="color:var(--accent)">مفهوم در حال آزمون:</strong> ${escapeHtml(winner.title)}</div>`
              : ''
          }
          <div class="space-y-2">
            ${
              assumptions.length
                ? assumptions
                    .map(
                      (a, idx) => `
                      <div class="p-3 rounded-lg surface-well text-xs space-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                          <span class="font-semibold" style="color:var(--accent)">[${escapeHtml(a.category)}]</span>
                          <div class="flex items-center gap-2">
                            <select data-pop-assump-st="${idx}" class="field-input py-0.5 px-2 text-[11px] w-auto">
                              <option value="pending" ${a.status === 'pending' ? 'selected' : ''}>در انتظار تست</option>
                              <option value="validated" ${a.status === 'validated' ? 'selected' : ''}>تاییدشده با شاهد</option>
                              <option value="needs_pivot" ${a.status === 'needs_pivot' ? 'selected' : ''}>ردشده — نیازمند اصلاح</option>
                            </select>
                            <button type="button" data-pop-del-assump="${idx}" style="color:var(--danger)">×</button>
                          </div>
                        </div>
                        <div class="font-medium">${escapeHtml(a.text)}</div>
                        <div class="type-caption text-[11px]">روش آزمون سریع: ${escapeHtml(a.testMethod || '—')}</div>
                      </div>
                    `
                    )
                    .join('')
                : `<div class="type-caption py-5 text-center border border-dashed rounded" style="border-color:var(--line-strong)">فرضیات حیاتی مطلوبیت، امکان‌پذیری فنی و پایداری مالی را ثبت کنید.</div>`
            }
          </div>
          <form id="pop-add-assump" class="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-3 hairline-t">
            <select id="pop-a-cat" class="field-input py-1.5 text-xs sm:col-span-3">
              <option value="مطلوبیت مشتری">مطلوبیت مشتری</option>
              <option value="پایداری مالی">پایداری مالی</option>
              <option value="امکان‌پذیری فنی">امکان‌پذیری فنی</option>
            </select>
            <input type="text" id="pop-a-txt" placeholder="فرضیه حیاتی..." class="field-input py-1.5 text-xs sm:col-span-5" />
            <input type="text" id="pop-a-test" placeholder="روش راستی‌آزمایی..." class="field-input py-1.5 text-xs sm:col-span-3" />
            <button type="submit" class="btn-solid py-1.5 px-2 text-xs sm:col-span-1">+</button>
          </form>
        `;
        modalBody.querySelector('#pop-add-assump')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const cEl = modalBody.querySelector('#pop-a-cat');
          const tEl = modalBody.querySelector('#pop-a-txt');
          const mEl = modalBody.querySelector('#pop-a-test');
          if (!tEl?.value.trim()) return;
          if (!Array.isArray(L.assumptions)) L.assumptions = [];
          L.assumptions.push({
            id: Date.now(),
            category: cEl?.value || 'مطلوبیت مشتری',
            text: tEl.value.trim(),
            testMethod: mEl?.value.trim() || 'مصاحبه و تست نمونه اولیه',
            status: 'pending'
          });
          saveStudioState();
          renderPopupBody(7);
          renderLiedtkaDiagram();
        });
        modalBody.querySelectorAll('[data-pop-assump-st]').forEach((sel) => {
          sel.addEventListener('change', () => {
            const idx = Number(sel.getAttribute('data-pop-assump-st'));
            if (L.assumptions?.[idx]) {
              L.assumptions[idx].status = sel.value;
              saveStudioState();
            }
          });
        });
        modalBody.querySelectorAll('[data-pop-del-assump]').forEach((btn) => {
          btn.addEventListener('click', () => {
            L.assumptions.splice(Number(btn.getAttribute('data-pop-del-assump')), 1);
            saveStudioState();
            renderPopupBody(7);
            renderLiedtkaDiagram();
          });
        });
      } else if (num === 8) {
        modalBody.innerHTML = `
          <p class="type-caption m-0">ساده‌ترین نمونه ملموس و قابل کلیکی که پیش از کدنویسی سنگین می‌توانید مقابل کاربر قرار دهید تا فرضیات ابزار ۷ را آزمایش کنید چیست؟</p>
          <div>
            <label class="block text-xs font-semibold mb-1.5">برنامه نمونه‌سازی سریع (صفحات و تعاملات کلیدی پروتوتایپ)</label>
            <textarea id="pop-proto-inp" rows="5" class="field-input text-xs md:text-sm" placeholder="مشخص کنید کدام ۳ تا ۴ صفحه کلیدی را ترسیم می‌کنید تا کاربر جریان اصلی را تجربه و نقد کند...">${escapeHtml(
              L.prototypePlan || ''
            )}</textarea>
          </div>
        `;
        modalBody.querySelector('#pop-proto-inp')?.addEventListener('input', (e) => {
          L.prototypePlan = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
      } else if (num === 9) {
        modalBody.innerHTML = `
          <p class="type-caption m-0">نمایش نمونه اولیه به چند کاربر بالقوه و ثبت تغییراتی که پیشنهاد خود مشتری در ایده شما ایجاد کرد (این بخش مستقیماً خوراک «روایت تردید و اصلاح فرضیات» در فاز ۴ است).</p>
          <div>
            <label class="block text-xs font-semibold mb-1">بازخوردها و نقدهای کاربران واقعی روی نمونه اولیه</label>
            <textarea id="pop-cocreate-fb" rows="3" class="field-input text-xs" placeholder="کاربر واقعی با دیدن پروتوتایپ به چه نکته‌ای اشاره کرد که قبلاً در ذهن شما نبود؟">${escapeHtml(
              L.coCreationFeedback || ''
            )}</textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">اصلاح یا چرخش انجام‌شده در ایده بر اساس هم‌آفرینی</label>
            <input type="text" id="pop-pivot-inp" value="${escapeHtml(L.pivotMade || '')}" placeholder="کدام بخش از ایده اولیه تعدیل، حذف یا تکمیل شد؟" class="field-input text-xs" />
          </div>
        `;
        modalBody.querySelector('#pop-cocreate-fb')?.addEventListener('input', (e) => {
          L.coCreationFeedback = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-pivot-inp')?.addEventListener('input', (e) => {
          L.pivotMade = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
      } else if (num === 10) {
        modalBody.innerHTML = `
          <p class="type-caption m-0">گره همگرایی نهایی: مرز دقیق نسخه کمینه پذیرفتنی (MVP) برای ورود به فاز اول و شاخص عددی سنجش موفقیت آن در عمل را مشخص کنید.</p>
          <div>
            <label class="block text-xs font-semibold mb-1">مرز دقیق نسخه کمینه پذیرفتنی (MVP)</label>
            <textarea id="pop-mvp-scope" rows="3" class="field-input text-xs" placeholder="حداقل مسیر تراکنشی که ارزش اصلی پلتفرم را بدون پیچیدگی اضافی ثابت می‌کند...">${escapeHtml(
              L.mvpScope || ''
            )}</textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">سنجه عددی موفقیت آزمایش (Success Metric)</label>
            <input type="text" id="pop-metric-inp" value="${escapeHtml(L.successMetric || '')}" placeholder="مثلاً: کاهش زمان استعلام از ۳ ساعت به کمتر از ۱۰ دقیقه..." class="field-input text-xs" />
          </div>
          <div class="pt-3 hairline-t space-y-2">
            <div class="flex items-center justify-between gap-2">
              <label class="text-xs font-semibold" style="color:var(--accent)">بیانیه نهایی ارزش پیشنهادی تکامل‌یافته</label>
              <button type="button" id="pop-synth-btn" class="btn-ghost-accent py-1 px-2.5 text-xs">تولید خودکار از خروجی ۱۰ ابزار</button>
            </div>
            <textarea id="pop-vp-inp" rows="2" class="field-input text-xs">${escapeHtml(L.valueStatement || '')}</textarea>
          </div>
        `;
        modalBody.querySelector('#pop-mvp-scope')?.addEventListener('input', (e) => {
          L.mvpScope = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-metric-inp')?.addEventListener('input', (e) => {
          L.successMetric = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-vp-inp')?.addEventListener('input', (e) => {
          L.valueStatement = e.target.value;
          if (finalVpInput) finalVpInput.value = e.target.value;
          saveStudioState();
          renderLiedtkaDiagram();
        });
        modalBody.querySelector('#pop-synth-btn')?.addEventListener('click', () => {
          synthesizeValueProposition();
          const vpTa = modalBody.querySelector('#pop-vp-inp');
          if (vpTa) vpTa.value = studioState.liedtka.valueStatement || '';
        });
      }
    }

    function synthesizeValueProposition() {
      const L = studioState.liedtka;
      const title = studioState.meta.title || 'پلتفرم پیشنهادی ما';
      const persona = L.persona || 'مخاطبان هدف بازار';
      const pain = L.journeySteps?.[0]?.pain || L.valueChainLeakage || 'اصطکاک و هزینه‌های روش سنتی';
      const winner = (L.concepts || []).find((c) => c.selected) || L.concepts?.[0];
      const mech = winner ? `${winner.title} (${winner.mechanism})` : 'سازوکار واسطه‌گری دیجیتال و شفاف‌سازی اطلاعات';
      const metric = L.successMetric || 'کاهش محسوس زمان و ریسک مبادله';

      const statement = `${title} برای «${persona}» که با چالش «${pain.replace(/\.$/, '')}» روبه‌رو هستند، از طریق «${mech}» راهکاری متمایز فراهم می‌کند که منجر به «${metric}» می‌گردد.`;
      L.valueStatement = statement;
      if (finalVpInput) finalVpInput.value = statement;
      saveStudioState();
      renderLiedtkaDiagram();
      showToast('هسته ارزش پیشنهادی بر اساس خروجی ۱۰ ابزار جین لیدکا سنتز شد.', 'success');
    }

    // ترسیم نمودار ۴ موج واگرا-همگرا و ۱۰ ابزار جین لیدکا (کلیک روی هر عدد = باز شدن Popup همان ابزار)
    function renderLiedtkaDiagram() {
      const doneMap = getToolCompletionMap();
      const doneCount = Object.values(doneMap).filter(Boolean).length;
      if (progressBadge) {
        progressBadge.textContent = `${doneCount.toLocaleString('fa-IR')} از ۱۰ ابزار تکمیل شده`;
      }

      const styles = getComputedStyle(document.documentElement);
      const ink1 = styles.getPropertyValue('--ink-1').trim() || '#171715';
      const ink2 = styles.getPropertyValue('--ink-2').trim() || '#494742';
      const ink3 = styles.getPropertyValue('--ink-3').trim() || '#78756d';
      const accent = styles.getPropertyValue('--accent').trim() || '#0d6b63';
      const accentSoft = styles.getPropertyValue('--accent-soft').trim() || 'rgba(13,107,99,0.1)';
      const lineStrong = styles.getPropertyValue('--line-strong').trim() || '#c5c0b4';
      const surface = styles.getPropertyValue('--bg-surface').trim() || '#ffffff';

      const activeStageId = activePopupToolNum ? TOOL_META[activePopupToolNum]?.stageId : null;

      const stages = [
        {
          id: 'what-is',
          firstTool: 2,
          fa: 'چه هست؟',
          en: 'What is?',
          cx: 169,
          upper: 'M 56 246 C 108 170, 230 170, 282 246',
          lower: 'M 282 246 C 230 304, 108 304, 56 246',
          fillPath: 'M 56 246 C 108 170, 230 170, 282 246 C 230 304, 108 304, 56 246 Z'
        },
        {
          id: 'what-if',
          firstTool: 5,
          fa: 'چه می‌شود اگر؟',
          en: 'What if?',
          cx: 408,
          upper: 'M 282 246 C 350 48, 466 48, 534 246',
          lower: 'M 534 246 C 466 306, 350 306, 282 246',
          fillPath: 'M 282 246 C 350 48, 466 48, 534 246 C 466 306, 350 306, 282 246 Z'
        },
        {
          id: 'what-wows',
          firstTool: 7,
          fa: 'چه شگفت‌زده می‌کند؟',
          en: 'What wows?',
          cx: 644,
          upper: 'M 534 246 C 584 152, 704 152, 754 246',
          lower: 'M 754 246 C 704 304, 584 304, 534 246',
          fillPath: 'M 534 246 C 584 152, 704 152, 754 246 C 704 304, 584 304, 534 246 Z'
        },
        {
          id: 'what-works',
          firstTool: 9,
          fa: 'چه کار می‌کند؟',
          en: 'What works?',
          cx: 844,
          upper: 'M 754 246 C 796 196, 892 196, 934 246',
          lower: 'M 934 246 C 892 296, 796 296, 754 246',
          fillPath: 'M 754 246 C 796 196, 892 196, 934 246 C 892 296, 796 296, 754 246 Z'
        }
      ];

      const pins = [
        { num: 2, stage: 'what-is', x: 102, cy: 136, curveY: 210, fa: 'نقشه سفر', en: 'Journey Mapping' },
        { num: 3, stage: 'what-is', x: 170, cy: 136, curveY: 189, fa: 'زنجیره ارزش', en: 'Value Chain' },
        { num: 4, stage: 'what-is', x: 238, cy: 136, curveY: 211, fa: 'نگاشت ذهنی', en: 'Mind Mapping' },
        { num: 5, stage: 'what-if', x: 314, cy: 136, curveY: 186, fa: 'طوفان فکری', en: 'Brainstorming' },
        { num: 6, stage: 'what-if', x: 500, cy: 136, curveY: 186, fa: 'توسعه مفهوم', en: 'Concept Dev' },
        { num: 7, stage: 'what-wows', x: 608, cy: 136, curveY: 180, fa: 'آزمون فرضیات', en: 'Assumption Test' },
        { num: 8, stage: 'what-wows', x: 686, cy: 136, curveY: 183, fa: 'نمونه‌سازی سریع', en: 'Prototyping' },
        { num: 9, stage: 'what-works', x: 804, cy: 136, curveY: 214, fa: 'هم‌آفرینی با مشتری', en: 'Co-Creation' },
        { num: 10, stage: 'what-works', x: 892, cy: 136, curveY: 219, fa: 'راه‌اندازی یادگیرنده', en: 'Learning Launch' }
      ];

      const stageShapes = stages
        .map((st) => {
          const isAct = st.id === activeStageId;
          return `
            <g class="liedtka-stage-hit" data-svg-first-tool="${st.firstTool}">
              <path d="${st.fillPath}" fill="${isAct ? accentSoft : 'transparent'}" stroke="none" />
              <path d="${st.upper}" fill="none" stroke="${isAct ? accent : ink1}" stroke-width="${isAct ? '3.2' : '2.5'}" stroke-linecap="round" />
              <path d="${st.lower}" fill="none" stroke="${isAct ? accent : ink1}" stroke-width="${isAct ? '3.2' : '2.5'}" stroke-linecap="round" />
              <text x="${st.cx}" y="244" text-anchor="middle" fill="${isAct ? accent : ink1}" font-size="13.5" font-weight="700">${st.fa}</text>
              <text x="${st.cx}" y="263" text-anchor="middle" fill="${ink3}" font-size="11.5" font-style="italic" font-weight="500">${st.en}</text>
            </g>
          `;
        })
        .join('');

      const tailPaths = `
        <path d="M 38 266 L 56 246 M 38 226 L 56 246" stroke="${ink1}" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 934 246 L 952 226 M 934 246 L 952 266" stroke="${ink1}" stroke-width="2.5" stroke-linecap="round" />
      `;

      const visDone = doneMap[1];
      const visFocused = activePopupToolNum === 1;
      const umbrellaArch = `
        <path d="M 52 216 L 52 68 Q 52 38 82 38 L 908 38 Q 938 38 938 68 L 938 216"
              fill="none" stroke="${accent}" stroke-width="1.6" stroke-dasharray="3.5 3.5" stroke-opacity="0.7" />
        <polygon points="48,213 56,213 52,221" fill="${accent}" opacity="0.75" />
        <polygon points="934,213 942,213 938,221" fill="${accent}" opacity="0.75" />
        <g class="liedtka-pin-node" data-svg-pin="1">
          <rect x="424" y="6" width="142" height="22" rx="4" fill="${surface}" />
          <text x="495" y="19" text-anchor="middle" fill="${ink1}" font-size="11.5" font-weight="700">بصری‌سازی · Visualization</text>
          <circle class="pin-main-circle" cx="495" cy="38" r="${visFocused ? 16.5 : 14.5}" fill="${visDone ? accent : surface}" stroke="${accent}" stroke-width="2.2" />
          <text x="495" y="42.5" text-anchor="middle" fill="${visDone ? '#ffffff' : accent}" font-size="12" font-weight="700">1</text>
        </g>
      `;

      const pinsHtml = pins
        .map((p) => {
          const isDone = doneMap[p.num];
          const isPinFocus = activePopupToolNum === p.num;
          const circleFill = isDone ? accent : surface;
          const numFill = isDone ? '#ffffff' : accent;
          return `
            <g class="liedtka-pin-node" data-svg-pin="${p.num}">
              <line x1="${p.x}" y1="${p.cy + 14.5}" x2="${p.x}" y2="${p.curveY}" stroke="${isDone ? accent : lineStrong}" stroke-width="1.6" />
              <circle cx="${p.x}" cy="${p.curveY}" r="3.6" fill="${isDone ? accent : lineStrong}" />
              <text x="${p.x}" y="${p.cy - 33}" text-anchor="middle" fill="${ink1}" font-size="10.5" font-weight="600">${p.fa}</text>
              <text x="${p.x}" y="${p.cy - 19}" text-anchor="middle" fill="${ink3}" font-size="9" font-weight="400">${p.en}</text>
              <circle class="pin-main-circle" cx="${p.x}" cy="${p.cy}" r="${isPinFocus ? 16.5 : 14.5}" fill="${circleFill}" stroke="${accent}" stroke-width="${isPinFocus ? '2.8' : '2'}" />
              <text x="${p.x}" y="${p.cy + 4.2}" text-anchor="middle" fill="${numFill}" font-size="11.5" font-weight="700">${p.num}</text>
            </g>
          `;
        })
        .join('');

      svgEl.innerHTML = `${stageShapes}${tailPaths}${umbrellaArch}${pinsHtml}`;

      svgEl.querySelectorAll('[data-svg-pin]').forEach((el) => {
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          openToolPopup(Number(el.getAttribute('data-svg-pin')));
        });
      });

      svgEl.querySelectorAll('[data-svg-first-tool]').forEach((el) => {
        el.addEventListener('click', () => {
          openToolPopup(Number(el.getAttribute('data-svg-first-tool')));
        });
      });
    }

    modalCloseX?.addEventListener('click', closeToolPopup);
    modalDoneBtn?.addEventListener('click', closeToolPopup);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeToolPopup();
    });
    modalPrevBtn?.addEventListener('click', () => {
      if (activePopupToolNum && activePopupToolNum > 1) openToolPopup(activePopupToolNum - 1);
    });
    modalNextBtn?.addEventListener('click', () => {
      if (activePopupToolNum && activePopupToolNum < 10) openToolPopup(activePopupToolNum + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalBackdrop.classList.contains('is-hidden')) {
        closeToolPopup();
      }
    });

    function renderAllLiedtka() {
      const L = studioState.liedtka;
      if (finalVpInput && finalVpInput.value !== (L.valueStatement || '')) {
        finalVpInput.value = L.valueStatement || '';
      }
      renderLiedtkaDiagram();
      if (activePopupToolNum) renderPopupBody(activePopupToolNum);
    }

    finalVpInput?.addEventListener('input', () => {
      studioState.liedtka.valueStatement = finalVpInput.value;
      saveStudioState();
      renderLiedtkaDiagram();
    });

    autoSynthBtn?.addEventListener('click', synthesizeValueProposition);

    copyMdBtn?.addEventListener('click', () => {
      copyMarkdown(buildLiedtkaMarkdown(), 'گزارش کامل فرآیند تفکر طراحی جین لیدکا کپی شد.');
    });

    resetBtn?.addEventListener('click', () => {
      studioState.liedtka = cloneData(PRESETS.blank.liedtka);
      if (finalVpInput) finalVpInput.value = '';
      saveStudioState();
      renderAllLiedtka();
      showToast('بوم تفکر طراحی پاک‌سازی شد.');
    });

    rerenderCallbacks.push(renderAllLiedtka);
    renderAllLiedtka();
  }

  function buildLiedtkaMarkdown() {
    const L = studioState.liedtka || {};
    const jSteps = (L.journeySteps || []).map((s, i) => `  ${i + 1}. **${s.step}** — *نقطه درد:* ${s.pain}`).join('\n');
    const clusters = (L.mindMapClusters || []).join(' ، ');
    const whatIfs = (L.whatIfs || [])
      .map((w) => `- [${w.status === 'shortlisted' ? 'برگزیده' : w.status === 'pruned' ? 'ردشده' : 'ایده'} | ${w.lens}] ${w.text}`)
      .join('\n');
    const concepts = (L.concepts || [])
      .map((c) => `- ${c.selected ? '**[مفهوم نهایی منتخب]** ' : ''}${c.title}: ${c.mechanism} (${c.edge || '—'})`)
      .join('\n');
    const assumptions = (L.assumptions || [])
      .map((a) => `- [${a.category} | وضعیت: ${a.status}] ${a.text} ← *روش تست:* ${a.testMethod}`)
      .join('\n');

    return [
      `## ۱. فرآیند تفکر طراحی در کسب‌وکار (مدل ۴ پرسش و ۱۰ ابزار جین لیدکا)`,
      ``,
      `### ابزار ۱ (چتر سراسری): بصری‌سازی (Visualization)`,
      `${L.visualization || '—'}`,
      ``,
      `### مرحله اول: چه هست؟ (What is?)`,
      `- **مخاطب هدف (ابزار ۲ — نقشه سفر):** ${L.persona || '—'}`,
      jSteps || '  - —',
      `- **بازیگران زنجیره ارزش (ابزار ۳):** ${L.valueChainActors || '—'}`,
      `- **گلوگاه و نشت ارزش:** ${L.valueChainLeakage || '—'}`,
      `- **الگوهای نگاشت ذهنی (ابزار ۴):** ${clusters || '—'}`,
      `- **معیارهای طراحی (خروجی همگرای مرحله اول):** ${L.designCriteria || '—'}`,
      ``,
      `### مرحله دوم: چه می‌شود اگر؟ (What if?)`,
      `#### طوفان فکری (ابزار ۵)`,
      whatIfs || '- —',
      `#### توسعه مفهوم محصول (ابزار ۶ — خروجی همگرای مرحله دوم)`,
      concepts || '- —',
      ``,
      `### مرحله سوم: چه چیزی شگفت‌زده می‌کند؟ (What wows?)`,
      `#### آزمون فرضیات کلیدی (ابزار ۷)`,
      assumptions || '- —',
      `#### برنامه نمونه‌سازی سریع (ابزار ۸)`,
      `${L.prototypePlan || '—'}`,
      ``,
      `### مرحله چهارم: چه چیزی کار می‌کند؟ (What works?)`,
      `- **بازخورد هم‌آفرینی با مشتری (ابزار ۹):** ${L.coCreationFeedback || '—'}`,
      `- **اصلاح و چرخش انجام‌شده در ایده:** ${L.pivotMade || '—'}`,
      `- **محدوده آزمایش یادگیرنده MVP (ابزار ۱۰):** ${L.mvpScope || '—'}`,
      `- **سنجه عددی موفقیت:** ${L.successMetric || '—'}`,
      ``,
      `### بیانیه نهایی ارزش پیشنهادی تکامل‌یافته`,
      `> ${L.valueStatement || '—'}`
    ].join('\n');
  }

  /* ==========================================================================
     ابزار ۰۲: ارزیابی ۸ پرسش ایده بالغ + نمودار رادار هندسی تطبیق‌پذیر با تم
     ========================================================================== */
  const RADAR_QUESTIONS = [
    'آیا تقاضای بالفعل و نیازی واقعی در بازار کنونی برای این راه‌حل وجود دارد؟',
    'آیا ایده پاسخگوی نیازی واقعی است یا صرفاً متکی بر فرضیات ذهنی طراح است؟',
    'ایده در کدام طبقه‌بندی قرار می‌گیرد؟ (بنیادین، ترکیبی یا تطبیقی)',
    'سقف رشد طبیعی و ظرفیت مقیاس‌پذیری کسب‌وکار کجاست؟',
    'مشتریان حاضرند دقیقاً در ازای کدام ارزش یا خدمت وجه پرداخت نمایند؟',
    'آیا امکان ارزیابی میدانی و دریافت بازخورد اولیه از کاربران بالقوه وجود دارد؟',
    'در صورت بروز مانع در مدل عملیاتی، چه راهکارها و سناریوهای واکنشی پیش‌بینی شده است؟',
    'گزینه‌ها و روش‌های جاری مخاطبان برای حل این نیاز چیست و بدون این سامانه چه فرایندی طی می‌شود؟'
  ];

  const RADAR_SHORT_LABELS = [
    'تقاضای واقعی',
    'نیاز در برابر فرض',
    'طبقه‌بندی ایده',
    'مقیاس‌پذیری',
    'تمایل پرداخت',
    'آزمون میدانی',
    'سناریوی واکنشی',
    'جایگزین‌های فعلی'
  ];

  function initRadarWorkshop() {
    const svg = document.getElementById('idea-radar-svg');
    const sliders = document.querySelectorAll('.radar-slider');
    if (!svg || !sliders.length) return;

    const scoreLabels = document.querySelectorAll('.radar-score-val');
    const totalScoreEl = document.getElementById('radar-total-score');
    const ideaTypeSelect = document.getElementById('radar-idea-type');
    const evidenceInputs = document.querySelectorAll('.radar-evidence-input');
    const toggleEvidenceBtn = document.getElementById('radar-toggle-evidence');
    const diagnosticsEl = document.getElementById('radar-diagnostics-box');
    const copyMdBtn = document.getElementById('radar-copy-md-btn');

    const cx = 155;
    const cy = 155;
    const maxR = 104;

    function drawRadar() {
      const scores = studioState.radar.scores || [7, 7, 7, 7, 7, 7, 7, 7];
      const styles = getComputedStyle(document.documentElement);
      const lineCol = styles.getPropertyValue('--line-strong').trim() || '#c5c0b4';
      const inkCol = styles.getPropertyValue('--ink-2').trim() || '#494742';
      const accentCol = styles.getPropertyValue('--accent').trim() || '#0d6b63';
      const warmCol = styles.getPropertyValue('--warm').trim() || '#b45828';

      let html = '';

      [0.25, 0.5, 0.75, 1].forEach((lvl) => {
        const r = maxR * lvl;
        const pts = RADAR_SHORT_LABELS.map((_, idx) => {
          const a = (Math.PI * 2 * idx) / 8 - Math.PI / 2;
          return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
        }).join(' ');
        html += `<polygon points="${pts}" fill="none" stroke="${lineCol}" stroke-opacity="0.55" stroke-width="1" />`;
      });

      const benchPts = RADAR_SHORT_LABELS.map((_, idx) => {
        const a = (Math.PI * 2 * idx) / 8 - Math.PI / 2;
        const r = maxR * 0.7;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      html += `<polygon points="${benchPts}" fill="none" stroke="${warmCol}" stroke-width="1.25" stroke-dasharray="4 3" stroke-opacity="0.75" />`;

      RADAR_SHORT_LABELS.forEach((lbl, idx) => {
        const a = (Math.PI * 2 * idx) / 8 - Math.PI / 2;
        const xEnd = cx + maxR * Math.cos(a);
        const yEnd = cy + maxR * Math.sin(a);
        const lx = cx + (maxR + 26) * Math.cos(a);
        const ly = cy + (maxR + 20) * Math.sin(a);
        html += `<line x1="${cx}" y1="${cy}" x2="${xEnd.toFixed(1)}" y2="${yEnd.toFixed(1)}" stroke="${lineCol}" stroke-opacity="0.5" stroke-width="1" />`;
        html += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${inkCol}" font-size="9.5" font-weight="500" text-anchor="middle" dominant-baseline="middle">${lbl}</text>`;
      });

      const dataPoints = scores.map((val, idx) => {
        const a = (Math.PI * 2 * idx) / 8 - Math.PI / 2;
        const r = (val / 10) * maxR;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), val };
      });

      const polyStr = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      html += `<polygon points="${polyStr}" fill="${accentCol}" fill-opacity="0.16" stroke="${accentCol}" stroke-width="2" />`;

      dataPoints.forEach((p) => {
        const dotCol = p.val < 6 ? warmCol : accentCol;
        html += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${dotCol}" />`;
      });

      svg.innerHTML = html;

      const sum = scores.reduce((a, b) => a + b, 0);
      const pct = Math.round((sum / 80) * 100);
      if (totalScoreEl) totalScoreEl.textContent = `${pct.toLocaleString('fa-IR')}٪`;

      if (diagnosticsEl) {
        const weak = scores.map((s, idx) => (s < 6 ? RADAR_SHORT_LABELS[idx] : null)).filter(Boolean);
        if (!weak.length) {
          diagnosticsEl.innerHTML = `<span class="font-semibold" style="color:var(--accent)">وضعیت متوازن:</span> هر ۸ شاخص بالای حد آستانه قرار دارند؛ شواهد تجربی متناظر را در جدول مستند کنید.`;
        } else {
          diagnosticsEl.innerHTML = `<span class="font-semibold" style="color:var(--warm)">نیازمند بازنگری پیش از ارائه فاز اول:</span> شاخص‌های «${weak.join('، ')}» امتیاز زیر ۶ دارند و در داوری چالش‌برانگیز خواهند بود.`;
        }
      }
    }

    function syncRadar() {
      const r = studioState.radar;
      sliders.forEach((sl, idx) => {
        const v = Number(r.scores?.[idx] ?? 7);
        sl.value = v;
        if (scoreLabels[idx]) scoreLabels[idx].textContent = `${v.toLocaleString('fa-IR')} از ۱۰`;
      });
      if (ideaTypeSelect && r.ideaType) ideaTypeSelect.value = r.ideaType;
      evidenceInputs.forEach((inp, idx) => {
        inp.value = r.evidence?.[idx] || '';
      });
      drawRadar();
    }

    sliders.forEach((sl, idx) => {
      sl.addEventListener('input', () => {
        const val = Number(sl.value);
        studioState.radar.scores[idx] = val;
        if (scoreLabels[idx]) scoreLabels[idx].textContent = `${val.toLocaleString('fa-IR')} از ۱۰`;
        drawRadar();
        saveStudioState();
      });
    });

    ideaTypeSelect?.addEventListener('change', () => {
      studioState.radar.ideaType = ideaTypeSelect.value;
      saveStudioState();
    });

    evidenceInputs.forEach((inp, idx) => {
      inp.addEventListener('input', () => {
        if (!Array.isArray(studioState.radar.evidence)) {
          studioState.radar.evidence = Array(8).fill('');
        }
        studioState.radar.evidence[idx] = inp.value;
        saveStudioState();
      });
    });

    let evidenceOpen = true;
    toggleEvidenceBtn?.addEventListener('click', () => {
      evidenceOpen = !evidenceOpen;
      document.querySelectorAll('.radar-evidence-wrap').forEach((el) => {
        el.classList.toggle('is-hidden', !evidenceOpen);
      });
      toggleEvidenceBtn.textContent = evidenceOpen ? 'پنهان کردن فیلدهای شواهد' : 'نمایش فیلدهای شواهد تجربی';
    });

    copyMdBtn?.addEventListener('click', () => {
      copyMarkdown(buildRadarMarkdown(), 'جدول ارزیابی ۸ پرسش ایده بالغ کپی شد.');
    });

    window.redrawIdeaRadar = drawRadar;
    rerenderCallbacks.push(syncRadar);
    syncRadar();
  }

  function buildRadarMarkdown() {
    const r = studioState.radar;
    const sum = (r.scores || []).reduce((a, b) => a + b, 0);
    const pct = Math.round((sum / 80) * 100);
    const rows = RADAR_QUESTIONS.map((q, idx) => {
      const sc = r.scores?.[idx] ?? 7;
      const ev = (r.evidence?.[idx] || '—').replace(/\|/g, '/');
      return `| ${idx + 1} | ${q} | ${sc}/10 | ${ev} |`;
    }).join('\n');

    return [
      `## ۲. ارزیابی بلوغ ایده با پرسش‌های هشت‌گانه درس`,
      `- **طبقه‌بندی ایده:** ${r.ideaType || 'ترکیبی'}`,
      `- **شاخص کل آمادگی ایده:** ${pct}%`,
      ``,
      `| ردیف | پرسش کلیدی ارزیابی | امتیاز | شواهد تجربی و مستندات بازار |`,
      `| :---: | :--- | :---: | :--- |`,
      rows
    ].join('\n');
  }

  /* ==========================================================================
     ابزار ۰۳: بوم مدل کسب‌وکار ۹ بخشی اوستروالدر (BMC)
     ========================================================================== */
  const BMC_BLOCKS = [
    { key: 'kp', num: '۰۸', title: 'شرکای کلیدی', en: 'Key Partners', cellClass: 'bmc-cell-kp', placeholder: 'تأمین‌کننده، لجستیک، زیرساخت...' },
    { key: 'ka', num: '۰۷', title: 'فعالیت‌های کلیدی', en: 'Key Activities', cellClass: 'bmc-cell-ka', placeholder: 'احراز صلاحیت، تطبیق سفارش...' },
    { key: 'kr', num: '۰۶', title: 'منابع کلیدی', en: 'Key Resources', cellClass: 'bmc-cell-kr', placeholder: 'دیتابیس قیمت، الگوریتم اعتماد...' },
    { key: 'vp', num: '۰۲', title: 'ارزش‌های پیشنهادی', en: 'Value Propositions', cellClass: 'bmc-cell-vp', placeholder: 'مزیت رقابتی و رفع اصطکاک...' },
    { key: 'cr', num: '۰۴', title: 'ارتباط با مشتری', en: 'Customer Relationships', cellClass: 'bmc-cell-cr', placeholder: 'داوری اختلاف، پشتیبانی، وفاداری...' },
    { key: 'ch', num: '۰۳', title: 'کانال‌های ارتباطی', en: 'Channels', cellClass: 'bmc-cell-ch', placeholder: 'وب‌اپلیکیشن، سئو، پیام‌رسان...' },
    { key: 'cs', num: '۰۱', title: 'بخش‌های مشتریان', en: 'Customer Segments', cellClass: 'bmc-cell-cs', placeholder: 'سوی تقاضا و سوی عرضه بازار...' },
    { key: 'cost', num: '۰۹', title: 'ساختار هزینه‌ها', en: 'Cost Structure', cellClass: 'bmc-cell-cost', placeholder: 'زیرساخت فنی، جذب کاربر، عملیات...' },
    { key: 'rev', num: '۰۵', title: 'جریان‌های درآمدی', en: 'Revenue Streams', cellClass: 'bmc-cell-rev', placeholder: 'کارمزد تراکنش، اشتراک، مارک‌آپ...' }
  ];

  function initBMCWorkshop() {
    const grid = document.getElementById('bmc-grid-container');
    if (!grid) return;

    const compBadge = document.getElementById('bmc-completeness-badge');
    const clearBtn = document.getElementById('bmc-clear-blank');
    const sampleBtn = document.getElementById('bmc-load-sample');
    const copyBtn = document.getElementById('bmc-copy-md-btn');

    function renderBMC() {
      let filled = 0;
      BMC_BLOCKS.forEach((b) => {
        if ((studioState.bmc[b.key] || []).length > 0) filled++;
      });

      if (compBadge) {
        compBadge.textContent = `${filled.toLocaleString('fa-IR')} از ۹ بخش تکمیل شده`;
      }

      grid.innerHTML = BMC_BLOCKS.map((blk) => {
        const items = studioState.bmc[blk.key] || [];
        const itemsHtml = items.length
          ? items
              .map(
                (txt, iIdx) => `
                <li class="group flex items-start justify-between gap-2 py-1 px-1.5 rounded hover:bg-black/5 text-xs leading-relaxed">
                  <span class="font-normal">• ${escapeHtml(txt)}</span>
                  <button type="button" data-bmc-del="${blk.key}" data-idx="${iIdx}" class="opacity-40 group-hover:opacity-100 text-[11px] px-1 shrink-0" style="color:var(--danger)" title="حذف مورد">×</button>
                </li>
              `
              )
              .join('')
          : `<li class="type-caption py-2">موردی ثبت نشده است</li>`;

        return `
          <div class="bmc-cell ${blk.cellClass}">
            <div class="space-y-2">
              <div class="flex items-baseline justify-between gap-2 pb-1.5 hairline-b">
                <h5 class="text-xs font-semibold m-0">${blk.title}</h5>
                <span class="text-[10px] font-light opacity-65 font-mono">${blk.en}</span>
              </div>
              <ul class="list-none m-0 p-0 space-y-0.5">${itemsHtml}</ul>
            </div>

            <form data-bmc-form="${blk.key}" class="pt-2 mt-2 hairline-t flex items-center gap-1">
              <input type="text" data-bmc-input="${blk.key}" placeholder="${blk.placeholder}" class="field-input py-1 px-2 text-xs" />
              <button type="submit" class="btn-quiet py-1 px-2 text-xs shrink-0">+</button>
            </form>
          </div>
        `;
      }).join('');

      grid.querySelectorAll('[data-bmc-form]').forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const key = form.getAttribute('data-bmc-form');
          const inp = form.querySelector(`[data-bmc-input="${key}"]`);
          const val = inp?.value.trim();
          if (!val) return;
          if (!Array.isArray(studioState.bmc[key])) studioState.bmc[key] = [];
          studioState.bmc[key].push(val);
          inp.value = '';
          saveStudioState();
          renderBMC();
          if (window.spatialAudio) window.spatialAudio.playClick(600, 0.035);
        });
      });

      grid.querySelectorAll('[data-bmc-del]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-bmc-del');
          const idx = Number(btn.getAttribute('data-idx'));
          studioState.bmc[key]?.splice(idx, 1);
          saveStudioState();
          renderBMC();
        });
      });
    }

    clearBtn?.addEventListener('click', () => {
      studioState.bmc = cloneData(PRESETS.blank.bmc);
      saveStudioState();
      renderBMC();
      showToast('بوم مدل کسب‌وکار خالی شد.');
    });

    sampleBtn?.addEventListener('click', () => {
      studioState.bmc = cloneData(PRESETS.b2b.bmc);
      saveStudioState();
      renderBMC();
      showToast('نمونه بوم B2B بارگذاری شد.', 'success');
    });

    copyBtn?.addEventListener('click', () => {
      copyMarkdown(buildBMCMarkdown(), 'بوم مدل کسب‌وکار ۹ بخشی کپی شد.');
    });

    rerenderCallbacks.push(renderBMC);
    renderBMC();
  }

  function buildBMCMarkdown() {
    const lines = [`## ۳. بوم مدل کسب‌وکار ۹ بخشی (${studioState.meta.title || 'پروژه'})`, ``];
    BMC_BLOCKS.forEach((b) => {
      const arr = studioState.bmc[b.key] || [];
      lines.push(`### ${b.title} (${b.en})`);
      if (arr.length) {
        arr.forEach((item) => lines.push(`- ${item}`));
      } else {
        lines.push(`- —`);
      }
      lines.push(``);
    });
    return lines.join('\n');
  }

  /* ==========================================================================
     ابزار ۰۴: قیف بازاریابی AIDA، هزینه جذب مشتری (CAC) و اقتصاد واحد
     ========================================================================== */
  function initAidaFunnelWorkshop() {
    const inpA = document.getElementById('inp-aida-a');
    const inpI = document.getElementById('inp-aida-i');
    const inpD = document.getElementById('inp-aida-d');
    const inpAct = document.getElementById('inp-aida-act');
    const inpRev = document.getElementById('inp-aida-rev');
    const inpSpend = document.getElementById('inp-aida-spend');
    if (!inpA) return;

    const valA = document.getElementById('val-aida-a');
    const valI = document.getElementById('val-aida-i');
    const valD = document.getElementById('val-aida-d');
    const valAct = document.getElementById('val-aida-act');
    const valRev = document.getElementById('val-aida-rev');
    const valSpend = document.getElementById('val-aida-spend');

    const outCustomers = document.getElementById('out-aida-customers');
    const outCashflow = document.getElementById('out-aida-cashflow');
    const outConv = document.getElementById('out-aida-conv');
    const outCac = document.getElementById('out-aida-cac');
    const outNetUnit = document.getElementById('out-aida-net-unit');
    const diagnosisEl = document.getElementById('aida-bottleneck-diagnosis');
    const copyMdBtn = document.getElementById('funnel-copy-md-btn');

    function calcAndRender() {
      const A = Number(inpA.value);
      const I_rate = Number(inpI.value);
      const D_rate = Number(inpD.value);
      const Act_rate = Number(inpAct.value);
      const rev = Number(inpRev.value);
      const spend = Number(inpSpend ? inpSpend.value : 15000000);

      studioState.aida = { a: A, i: I_rate, d: D_rate, act: Act_rate, rev, spend };
      saveStudioState();

      const interested = Math.round(A * (I_rate / 100));
      const desired = Math.round(interested * (D_rate / 100));
      const customers = Math.max(1, Math.round(desired * (Act_rate / 100)));
      const totalCash = customers * rev;
      const overallConv = ((customers / A) * 100).toFixed(2);
      const cac = Math.round(spend / customers);
      const netUnit = rev - cac;

      if (valA) valA.textContent = `${A.toLocaleString('fa-IR')} بازدیدکننده`;
      if (valI) valI.textContent = `${I_rate.toLocaleString('fa-IR')}٪ (${interested.toLocaleString('fa-IR')} نفر)`;
      if (valD) valD.textContent = `${D_rate.toLocaleString('fa-IR')}٪ (${desired.toLocaleString('fa-IR')} نفر)`;
      if (valAct) valAct.textContent = `${Act_rate.toLocaleString('fa-IR')}٪`;
      if (valRev) valRev.textContent = `${rev.toLocaleString('fa-IR')} تومان`;
      if (valSpend) valSpend.textContent = `${spend.toLocaleString('fa-IR')} تومان`;

      if (outCustomers) outCustomers.textContent = `${customers.toLocaleString('fa-IR')} مشتری`;
      if (outCashflow) outCashflow.textContent = `${totalCash.toLocaleString('fa-IR')} تومان`;
      if (outConv) outConv.textContent = `${overallConv}٪`;
      if (outCac) outCac.textContent = `${cac.toLocaleString('fa-IR')} تومان`;
      if (outNetUnit) {
        outNetUnit.textContent = `${netUnit.toLocaleString('fa-IR')} تومان`;
        outNetUnit.style.color = netUnit >= 0 ? 'var(--accent)' : 'var(--danger)';
      }

      if (diagnosisEl) {
        let stageName = 'اشتیاق به اقدام (Action)';
        let advice = 'ساده‌سازی گام‌های ثبت سفارش، نمایش شفاف کارمزد و تضمین بازگشت وجه در درگاه آزمایشی.';
        if (I_rate <= D_rate && I_rate <= Act_rate) {
          stageName = 'آگاهی به علاقه (Interest)';
          advice = 'شفاف‌سازی فوری بیانیه ارزش در بالای صفحه فرود و تولید محتوای درون‌گرای مسئله‌محور.';
        } else if (D_rate <= I_rate && D_rate <= Act_rate) {
          stageName = 'علاقه به اشتیاق (Desire)';
          advice = 'افزودن ماشین‌حساب شفافیت قیمت، نظرات تاییدشده و نمادهای اعتماد حریم خصوصی.';
        }
        const unitNote =
          netUnit < 0
            ? 'هشدار اقتصاد واحد: هزینه جذب هر مشتری (CAC) از حاشیه سود هر سفارش فراتر رفته است.'
            : 'اقتصاد واحد مثبت است (درآمد سرانه هر تراکنش بالاتر از هزینه جذب مشتری قرار دارد).';

        diagnosisEl.innerHTML = `<strong class="font-semibold">گلوگاه اصلی ریزش در مرحله «${stageName}»:</strong> ${advice} <span class="block mt-1 font-medium" style="color:${
          netUnit < 0 ? 'var(--danger)' : 'var(--accent)'
        }">${unitNote}</span>`;
      }

      window.portalThree?.updateFunnelGeometry?.(A, I_rate, D_rate, Act_rate, rev);
    }

    function syncInputs() {
      const f = studioState.aida || PRESETS.b2b.aida;
      inpA.value = f.a ?? 10000;
      inpI.value = f.i ?? 45;
      inpD.value = f.d ?? 30;
      inpAct.value = f.act ?? 20;
      inpRev.value = f.rev ?? 250000;
      if (inpSpend) inpSpend.value = f.spend ?? 15000000;
      calcAndRender();
    }

    [inpA, inpI, inpD, inpAct, inpRev, inpSpend].forEach((el) => {
      el?.addEventListener('input', calcAndRender);
    });

    document.querySelectorAll('[data-funnel-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-funnel-view');
        document.querySelectorAll('[data-funnel-view]').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
        window.portalThree?.setFunnelView?.(view);
      });
    });

    copyMdBtn?.addEventListener('click', () => {
      copyMarkdown(buildFunnelMarkdown(), 'گزارش قیف بازاریابی و اقتصاد واحد کپی شد.');
    });

    rerenderCallbacks.push(syncInputs);
    setTimeout(syncInputs, 80);
  }

  function buildFunnelMarkdown() {
    const f = studioState.aida;
    const interested = Math.round(f.a * (f.i / 100));
    const desired = Math.round(interested * (f.d / 100));
    const customers = Math.max(1, Math.round(desired * (f.act / 100)));
    const conv = ((customers / f.a) * 100).toFixed(2);
    const cac = Math.round(f.spend / customers);
    const cash = customers * f.rev;

    return [
      `## ۴. تحلیل قیف بازاریابی (AIDA) و اقتصاد واحد`,
      `| شاخص | مقدار |`,
      `| :--- | :--- |`,
      `| ورودی سطح آگاهی (Awareness) | ${f.a.toLocaleString('fa-IR')} کاربر |`,
      `| مرحله علاقه (Interest — ${f.i}%) | ${interested.toLocaleString('fa-IR')} کاربر |`,
      `| مرحله اشتیاق (Desire — ${f.d}%) | ${desired.toLocaleString('fa-IR')} کاربر |`,
      `| مشتریان نهایی (Action — ${f.act}%) | ${customers.toLocaleString('fa-IR')} تراکنش موفق |`,
      `| نرخ تبدیل کل قیف | ${conv}% |`,
      `| بودجه جذب ماهانه | ${f.spend.toLocaleString('fa-IR')} تومان |`,
      `| هزینه جذب هر مشتری (CAC) | ${cac.toLocaleString('fa-IR')} تومان |`,
      `| میانگین حاشیه سود هر سفارش | ${f.rev.toLocaleString('fa-IR')} تومان |`,
      `| سود خالص واحد پس از کسر CAC | ${(f.rev - cac).toLocaleString('fa-IR')} تومان |`,
      `| مجموع جریان درآمدی دوره | ${cash.toLocaleString('fa-IR')} تومان |`
    ].join('\n');
  }

  /* ==========================================================================
     ابزار ۰۵: معمار ۱۰ سناریوی عملیاتی MVP + مولد README.md و AI_DISCLOSURE.md
     (بدون تب‌های پنهان‌کننده — هر ۳ بخش به صورت شفاف و آشکار در دسترس هستند)
     ========================================================================== */
  function initEngineeringStudioWorkshop() {
    const scenariosPanel = document.getElementById('eng-panel-scenarios');
    if (!scenariosPanel) return;

    let currentIdx = 0;

    const pillContainer = document.getElementById('bdd-scenario-pills');
    const countBadge = document.getElementById('bdd-scenario-count-badge');
    const addScenarioBtn = document.getElementById('bdd-add-scenario-btn');
    const deleteScenarioBtn = document.getElementById('bdd-delete-scenario-btn');
    const downloadScenariosBtn = document.getElementById('bdd-download-all-scenarios-btn');
    const copyScenarioBtn = document.getElementById('bdd-copy-btn');

    const bddInputs = {
      id: document.getElementById('bdd-id'),
      role: document.getElementById('bdd-role'),
      title: document.getElementById('bdd-title'),
      goal: document.getElementById('bdd-goal'),
      preconditions: document.getElementById('bdd-preconditions'),
      edgeCase: document.getElementById('bdd-edgecase'),
      given: document.getElementById('bdd-given'),
      when: document.getElementById('bdd-when'),
      then: document.getElementById('bdd-then'),
      phase4Status: document.getElementById('bdd-phase4-status'),
      evolutionNote: document.getElementById('bdd-evolution-note')
    };

    const linterAlert = document.getElementById('bdd-linter-alert');
    const previewEl = document.getElementById('bdd-markdown-preview');

    const antiPatterns = ['حالت تیره', 'دارک مود', 'dark mode', 'تم روشن', 'لودینگ', 'اسکلتون', 'skeleton', 'فرم تماس ایستا', 'درباره ما'];

    function formatSingleScenarioMd(s) {
      return [
        `### شناسه سناریو: ${s.id || 'SC-01'}`,
        `* **عنوان سناریو:** ${s.title || '—'}`,
        `* **نقش کاربری:** ${s.role || '—'}`,
        `* **وضعیت پیاده‌سازی (فاز ۴):** ${s.phase4Status || 'پیاده‌سازی کامل'}`,
        `* **هدف و ارزش تجاری:** ${s.goal || '—'}`,
        `* **پیش‌شرط‌ها:** ${s.preconditions || '—'}`,
        `* **مدیریت خطاهای مرزی:** ${s.edgeCase || '—'}`,
        `* **معیار پذیرش آزمون (Acceptance Criteria):**`,
        `  - **Given (فرض اولیه):** ${s.given || '—'}`,
        `  - **When (اقدام):** ${s.when || '—'}`,
        `  - **Then (نتیجه):** ${s.then || '—'}`,
        `* **سیر تحول و بازنگری در طول نیم‌سال:** ${s.evolutionNote || '—'}`
      ].join('\n');
    }

    function renderScenarioPills() {
      if (!Array.isArray(studioState.scenarios) || !studioState.scenarios.length) {
        studioState.scenarios = [createScenarioTemplate(1)];
      }
      if (currentIdx >= studioState.scenarios.length) {
        currentIdx = studioState.scenarios.length - 1;
      }

      const total = studioState.scenarios.length;
      if (countBadge) {
        countBadge.textContent = `${total.toLocaleString('fa-IR')} از حداقل ۱۰ سناریوی الزامی فاز چهارم`;
      }

      if (pillContainer) {
        pillContainer.innerHTML = studioState.scenarios
          .map((sc, idx) => {
            const active = idx === currentIdx;
            return `<button type="button" data-sc-idx="${idx}" class="${
              active ? 'btn-solid py-1 px-2.5 text-xs' : 'btn-quiet py-1 px-2.5 text-xs'
            }">${escapeHtml(sc.id || `SC-0${idx + 1}`)}</button>`;
          })
          .join('');

        pillContainer.querySelectorAll('[data-sc-idx]').forEach((btn) => {
          btn.addEventListener('click', () => {
            currentIdx = Number(btn.getAttribute('data-sc-idx'));
            loadCurrentScenarioIntoForm();
            renderScenarioPills();
          });
        });
      }
    }

    function loadCurrentScenarioIntoForm() {
      const cur = studioState.scenarios[currentIdx];
      if (!cur) return;
      Object.entries(bddInputs).forEach(([k, el]) => {
        if (el) el.value = cur[k] || '';
      });
      validateAndPreviewCurrent();
    }

    function validateAndPreviewCurrent() {
      const cur = studioState.scenarios[currentIdx];
      if (!cur) return;

      const combined = `${cur.title} ${cur.goal} ${cur.when}`.toLowerCase();
      const hasAntiPattern = antiPatterns.some((w) => combined.includes(w));

      if (linterAlert) {
        const wasHidden = linterAlert.classList.contains('is-hidden');
        linterAlert.classList.toggle('is-hidden', !hasAntiPattern);
        if (hasAntiPattern && wasHidden && window.spatialAudio) {
          window.spatialAudio.playWarningBuzz();
        }
      }

      if (previewEl) {
        previewEl.textContent = formatSingleScenarioMd(cur);
      }
    }

    Object.entries(bddInputs).forEach(([key, el]) => {
      el?.addEventListener('input', () => {
        const cur = studioState.scenarios[currentIdx];
        if (!cur) return;
        cur[key] = el.value;
        saveStudioState();
        if (key === 'id') renderScenarioPills();
        validateAndPreviewCurrent();
      });
    });

    addScenarioBtn?.addEventListener('click', () => {
      const nextNum = studioState.scenarios.length + 1;
      studioState.scenarios.push(createScenarioTemplate(nextNum));
      currentIdx = studioState.scenarios.length - 1;
      saveStudioState();
      renderScenarioPills();
      loadCurrentScenarioIntoForm();
      showToast(`سناریوی SC-${String(nextNum).padStart(2, '0')} اضافه شد.`, 'success');
    });

    deleteScenarioBtn?.addEventListener('click', () => {
      if (studioState.scenarios.length <= 1) {
        showToast('حداقل یک سناریو باید در فهرست باقی بماند.', 'error');
        return;
      }
      studioState.scenarios.splice(currentIdx, 1);
      if (currentIdx >= studioState.scenarios.length) currentIdx = studioState.scenarios.length - 1;
      saveStudioState();
      renderScenarioPills();
      loadCurrentScenarioIntoForm();
    });

    copyScenarioBtn?.addEventListener('click', () => {
      if (previewEl) copyMarkdown(previewEl.textContent, 'شناسنامه سناریوی فعلی کپی شد.');
    });

    downloadScenariosBtn?.addEventListener('click', () => {
      downloadFile('SCENARIOS_SPECIFICATION.md', buildAllScenariosMarkdown());
    });

    const rmInputs = {
      repoUrl: document.getElementById('rm-repo-url'),
      liveUrl: document.getElementById('rm-live-url'),
      stack: document.getElementById('rm-stack'),
      setup: document.getElementById('rm-setup'),
      env: document.getElementById('rm-env'),
      accounts: document.getElementById('rm-accounts')
    };
    const rmPreview = document.getElementById('rm-readme-preview');

    function buildReadmeContent() {
      const m = studioState.meta;
      const rm = studioState.readme;
      const vp = studioState.liedtka?.valueStatement || 'سامانه تحت وب یکپارچه شامل پرونده تحلیلی کسب‌وکار و MVP عملیاتی.';
      const scRows = (studioState.scenarios || [])
        .map((s, idx) => `${idx + 1}. **${s.id} — ${s.title}** (${s.role} | وضعیت: ${s.phase4Status})\n   - مسیر تست: ${s.when} ← نتیجه مورد انتظار: ${s.then}`)
        .join('\n');

      return [
        `# ${m.title || 'عنوان پروژه تجارت الکترونیکی'}`,
        ``,
        `> **ارزش پیشنهادی:** ${vp}`,
        ``,
        `## ۱. مشخصات عمومی`,
        `- **توسعه‌دهنده (دانشجو):** ${m.student || 'نام و شماره دانشجویی'}`,
        `- **حوزه کسب‌وکار:** ${m.domain || 'تجارت الکترونیک'}`,
        `- **نشانی نسخه برخط (Live Demo):** ${rm.liveUrl || 'https://your-project.vercel.app'}`,
        `- **نشانی مخزن گیت‌هاب:** ${rm.repoUrl || 'https://github.com/username/repo'}`,
        `- **درس:** تجارت الکترونیکی — دانشکده مهندسی کامپیوتر دانشگاه یزد`,
        ``,
        `## ۲. پشته فناوری (Tech Stack)`,
        `${rm.stack || 'Frontend / Backend / State & Persistence'}`,
        ``,
        `## ۳. راهنمای راه‌اندازی محلی`,
        '```bash',
        `${rm.setup || 'npm install\nnpm run dev'}`,
        '```',
        ``,
        `### نمونه متغیرهای محیطی (\`.env.example\`)`,
        '```env',
        `${rm.env || 'VITE_APP_MODE=sandbox'}`,
        '```',
        ``,
        `## ۴. حساب‌های کاربری آزمایشی (Seed Accounts)`,
        `> توجه: تمام تراکنش‌ها در محیط شبیه‌سازی‌شده (Sandbox) انجام شده و هیچ داده واقعی بانکی دریافت نمی‌شود.`,
        '```text',
        `${rm.accounts || 'Buyer: buyer@test.local / 123456'}`,
        '```',
        ``,
        `## ۵. راهنمای آزمون سناریوهای عملیاتی MVP`,
        scRows || '1. سناریوی پایه سیستم'
      ].join('\n');
    }

    function updateReadmePreview() {
      if (rmPreview) rmPreview.textContent = buildReadmeContent();
    }

    Object.entries(rmInputs).forEach(([k, el]) => {
      el?.addEventListener('input', () => {
        studioState.readme[k] = el.value;
        saveStudioState();
        updateReadmePreview();
      });
    });

    document.getElementById('rm-copy-btn')?.addEventListener('click', () => {
      copyMarkdown(buildReadmeContent(), 'محتوای فایل README.md کپی شد.');
    });
    document.getElementById('rm-download-btn')?.addEventListener('click', () => {
      downloadFile('README.md', buildReadmeContent());
    });

    const aiInputs = {
      tools: document.getElementById('ai-tools'),
      tier: document.getElementById('ai-tier'),
      strategy: document.getElementById('ai-strategy'),
      architecture: document.getElementById('ai-architecture'),
      debugLog: document.getElementById('ai-debug-log')
    };
    const aiPreview = document.getElementById('ai-disclosure-preview');

    function buildAiDisclosureContent() {
      const m = studioState.meta;
      const a = studioState.ai;
      return [
        `# سند شفافیت استفاده از هوش مصنوعی (AI_DISCLOSURE.md)`,
        ``,
        `- **پروژه:** ${m.title || 'پروژه درس تجارت الکترونیکی'}`,
        `- **دانشجو:** ${m.student || 'نام و شماره دانشجویی'}`,
        ``,
        `## ۱. ابزارها و مدل‌های مورد استفاده`,
        `${a.tools || 'ذکر دقیق مدل‌ها و دستیارهای کدنویسی مورد استفاده'}`,
        ``,
        `## ۲. نوع دسترسی و حساب کاربری`,
        `${a.tier || 'رایگان / اشتراکی'}`,
        ``,
        `## ۳. استراتژی هدایت و مهندسی پرامپت`,
        `${a.strategy || 'تبیین نحوه شکستن نیازمندی‌ها و هدایت مرحله‌به‌مرحله مدل'}`,
        ``,
        `## ۴. تصمیمات معماری متأثر از مدل`,
        `${a.architecture || 'تبیین بخش‌هایی که با هم‌فکری ابزارهای هوش مصنوعی ساختاردهی شده‌اند'}`,
        ``,
        `## ۵. گزارش اصلاح، بازنویسی و دیباگ دستی توسط دانشجو`,
        `${a.debugLog || 'گزارش مستند خطاهای تولیدشده توسط هوش مصنوعی که شخصاً دیباگ و بازنویسی شده‌اند'}`,
        ``,
        `---`,
        `*بدین‌وسیله تأیید می‌گردد مسئولیت علمی و فنی تک‌تک خطوط سورس‌کد و توانایی اعمال تغییرات زنده در جلسه تحویل بر عهده اینجانب است.*`
      ].join('\n');
    }

    function updateAiPreview() {
      if (aiPreview) aiPreview.textContent = buildAiDisclosureContent();
    }

    Object.entries(aiInputs).forEach(([k, el]) => {
      el?.addEventListener('input', () => {
        studioState.ai[k] = el.value;
        saveStudioState();
        updateAiPreview();
      });
    });

    document.getElementById('ai-copy-btn')?.addEventListener('click', () => {
      copyMarkdown(buildAiDisclosureContent(), 'محتوای فایل AI_DISCLOSURE.md کپی شد.');
    });
    document.getElementById('ai-download-btn')?.addEventListener('click', () => {
      downloadFile('AI_DISCLOSURE.md', buildAiDisclosureContent());
    });

    function syncEngineeringAll() {
      renderScenarioPills();
      loadCurrentScenarioIntoForm();
      Object.entries(rmInputs).forEach(([k, el]) => {
        if (el) el.value = studioState.readme?.[k] || '';
      });
      Object.entries(aiInputs).forEach(([k, el]) => {
        if (el) el.value = studioState.ai?.[k] || '';
      });
      updateReadmePreview();
      updateAiPreview();
    }

    rerenderCallbacks.push(syncEngineeringAll);
    syncEngineeringAll();
  }

  function buildAllScenariosMarkdown() {
    const list = studioState.scenarios || [];
    const matrixRows = list
      .map((s) => `| ${s.id} | ${s.title} | ${s.role} | ${s.phase4Status} | ${s.evolutionNote || '—'} |`)
      .join('\n');
    const details = list
      .map((s) =>
        [
          `### شناسه سناریو: ${s.id}`,
          `* **عنوان سناریو:** ${s.title}`,
          `* **نقش کاربری:** ${s.role}`,
          `* **هدف و ارزش تجاری:** ${s.goal}`,
          `* **پیش‌شرط‌ها:** ${s.preconditions}`,
          `* **مدیریت خطاهای مرزی:** ${s.edgeCase}`,
          `* **معیار پذیرش آزمون:**`,
          `  - **Given:** ${s.given}`,
          `  - **When:** ${s.when}`,
          `  - **Then:** ${s.then}`
        ].join('\n')
      )
      .join('\n\n---\n\n');

    return [
      `# شناسنامه رسمی و ماتریس وضعیت سناریوهای عملیاتی MVP`,
      ``,
      `## ماتریس وضعیت و سیر تحول سناریوها (ویژه فاز چهارم)`,
      `| شناسه | عنوان سناریو | نقش | وضعیت پیاده‌سازی | روایت بازنگری و تحول |`,
      `| :---: | :--- | :---: | :---: | :--- |`,
      matrixRows,
      ``,
      `## شرح تفصیلی سناریوها`,
      details
    ].join('\n');
  }

  /* ==========================================================================
     ابزار ۰۶ و جدول زنده بخش ۹: شبیه‌ساز یکپارچه روبریک ۶+۱ و محاسبه‌گر فریز ۴ ساعته
     ========================================================================== */
  function initRubricAndFreezeSystem() {
    const rubricSliders = document.querySelectorAll('[data-rubric-idx]');
    const phaseChks = document.querySelectorAll('[data-milestone-phase]');
    const dateInputs = document.querySelectorAll('[data-freeze-date]');
    const timeInputs = document.querySelectorAll('[data-freeze-time]');
    const auditChks = document.querySelectorAll('.predefense-audit-chk');

    function recalculateAll() {
      const r = studioState.rubric;
      const scores = r.scores || [0.9, 0.9, 0.9, 1.3, 1.0, 1.0, 0.5];
      const phases = r.phases || [true, true, true];

      rubricSliders.forEach((sl) => {
        const idx = Number(sl.getAttribute('data-rubric-idx'));
        if (!Number.isNaN(idx) && scores[idx] !== undefined) {
          sl.value = scores[idx];
        }
      });

      scores.forEach((val, idx) => {
        document.querySelectorAll(`[data-rubric-val="${idx}"]`).forEach((lbl) => {
          lbl.textContent = Number(val).toFixed(2);
        });
      });

      phaseChks.forEach((chk) => {
        const pIdx = Number(chk.getAttribute('data-milestone-phase')) - 1;
        if (pIdx >= 0 && pIdx < 3) chk.checked = Boolean(phases[pIdx]);
      });

      const rawBase = scores.slice(0, 6).reduce((a, b) => a + Number(b), 0);
      const bonus = Number(scores[6] || 0);
      const missedCount = phases.filter((x) => !x).length;
      const penalty = missedCount * 0.5;
      const maxCeiling = 6.0 - penalty;
      const cappedBase = Math.min(rawBase, maxCeiling);
      const finalGrade = cappedBase + bonus;

      document.querySelectorAll('[data-out-final-grade]').forEach((el) => {
        el.textContent = `${finalGrade.toFixed(2)} از ۷٫۰۰`;
      });

      document.querySelectorAll('[data-out-ceiling-note]').forEach((el) => {
        el.textContent =
          penalty > 0
            ? `سقف قطعی با کسر ${penalty.toFixed(1)} نمره غیبت مایلستون: ${maxCeiling.toFixed(1)} از ۶٫۰`
            : `سقف کامل ۶٫۰ نمره قطعی فعال است (ارائه بهنگام در هر ۳ فاز)`;
        el.style.color = penalty > 0 ? 'var(--danger)' : 'var(--accent)';
      });

      const barBase = document.getElementById('rubric-bar-base');
      const barBonus = document.getElementById('rubric-bar-bonus');
      const barPenalty = document.getElementById('rubric-bar-penalty');
      if (barBase) barBase.style.width = `${(cappedBase / 7) * 100}%`;
      if (barBonus) barBonus.style.width = `${(bonus / 7) * 100}%`;
      if (barPenalty) barPenalty.style.width = `${(penalty / 7) * 100}%`;

      const tVal = r.time || '14:00';
      const dVal = r.date || '';
      dateInputs.forEach((inp) => {
        if (inp.value !== dVal) inp.value = dVal;
      });
      timeInputs.forEach((inp) => {
        if (inp.value !== tVal) inp.value = tVal;
      });

      const [hh, mm] = tVal.split(':').map(Number);
      if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
        let freezeH = hh - 4;
        let prevDay = false;
        if (freezeH < 0) {
          freezeH += 24;
          prevDay = true;
        }
        const fTime = `${String(freezeH).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        let countdownText = '';

        if (dVal) {
          const defenseDate = new Date(`${dVal}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`);
          const freezeDate = new Date(defenseDate.getTime() - 4 * 3600 * 1000);
          const diffMs = freezeDate.getTime() - Date.now();
          if (!Number.isNaN(freezeDate.getTime())) {
            const faDate = freezeDate.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' });
            document.querySelectorAll('[data-out-freeze-time]').forEach((el) => {
              el.textContent = `${faDate} — ساعت ${fTime}`;
            });
            if (diffMs > 0) {
              const dLeft = Math.floor(diffMs / 86400000);
              const hLeft = Math.floor((diffMs % 86400000) / 3600000);
              countdownText = `${dLeft.toLocaleString('fa-IR')} روز و ${hLeft.toLocaleString('fa-IR')} ساعت مانده تا قفل شدن مخزن`;
            } else {
              countdownText = 'زمان فریز این نوبت سپری شده است.';
            }
          }
        } else {
          document.querySelectorAll('[data-out-freeze-time]').forEach((el) => {
            el.textContent = prevDay ? `ساعت ${fTime} (شب قبل از روز ارائه)` : `ساعت ${fTime} (همان روز ارائه)`;
          });
        }

        document.querySelectorAll('[data-out-freeze-countdown]').forEach((el) => {
          el.textContent = countdownText;
        });
      }

      const auditArr = r.audit || [false, false, false, false, false, false];
      let doneAudit = 0;
      auditChks.forEach((chk, idx) => {
        chk.checked = Boolean(auditArr[idx]);
        if (chk.checked) doneAudit++;
      });
      const auditBadge = document.getElementById('audit-progress-badge');
      if (auditBadge) {
        auditBadge.textContent = `${doneAudit.toLocaleString('fa-IR')} از ۶ مورد تایید شده`;
      }
    }

    rubricSliders.forEach((sl) => {
      sl.addEventListener('input', () => {
        const idx = Number(sl.getAttribute('data-rubric-idx'));
        studioState.rubric.scores[idx] = Number(sl.value);
        saveStudioState();
        recalculateAll();
      });
    });

    phaseChks.forEach((chk) => {
      chk.addEventListener('change', () => {
        const pIdx = Number(chk.getAttribute('data-milestone-phase')) - 1;
        studioState.rubric.phases[pIdx] = chk.checked;
        saveStudioState();
        recalculateAll();
      });
    });

    dateInputs.forEach((inp) => {
      inp.addEventListener('input', () => {
        studioState.rubric.date = inp.value;
        saveStudioState();
        recalculateAll();
      });
    });

    timeInputs.forEach((inp) => {
      inp.addEventListener('input', () => {
        studioState.rubric.time = inp.value;
        saveStudioState();
        recalculateAll();
      });
    });

    auditChks.forEach((chk, idx) => {
      chk.addEventListener('change', () => {
        if (!Array.isArray(studioState.rubric.audit)) {
          studioState.rubric.audit = [false, false, false, false, false, false];
        }
        studioState.rubric.audit[idx] = chk.checked;
        saveStudioState();
        recalculateAll();
      });
    });

    rerenderCallbacks.push(recalculateAll);
    recalculateAll();
  }

  function buildMasterDossierMarkdown() {
    const m = studioState.meta;
    return [
      `# پیش‌نویس یکپارچه پرونده تحلیلی کسب‌وکار الکترونیکی`,
      `- **عنوان سامانه:** ${m.title || '—'}`,
      `- **پژوهشگر و توسعه‌دهنده:** ${m.student || '—'}`,
      `- **حوزه فعالیت:** ${m.domain || '—'}`,
      ``,
      `---`,
      buildLiedtkaMarkdown(),
      ``,
      `---`,
      buildRadarMarkdown(),
      ``,
      `---`,
      buildBMCMarkdown(),
      ``,
      `---`,
      buildFunnelMarkdown(),
      ``,
      `---`,
      buildAllScenariosMarkdown()
    ].join('\n');
  }

  // همگام‌سازی خودکار نمودار لیدکا و رادار هنگام تغییر پالت رنگی
  window.redrawLiedtkaDiagram = () => {
    const svgEl = document.getElementById('liedtka-wave-svg');
    if (svgEl) {
      rerenderCallbacks.forEach((fn) => {
        if (fn.name === 'renderAllLiedtka') fn();
      });
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    initStudioTabs();
    initStudioProjectBar();
    initLiedtkaWorkshop();
    initRadarWorkshop();
    initBMCWorkshop();
    initAidaFunnelWorkshop();
    initEngineeringStudioWorkshop();
    initRubricAndFreezeSystem();
  });
})();
