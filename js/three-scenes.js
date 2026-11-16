/**
 * موتور گرافیک سه‌بعدی پرتال درس تجارت الکترونیکی دانشگاه یزد
 * طراحی‌شده با حلقه رندر واحد مبتنی بر Delta-Time (سازگار با ۶۰ تا ۱۴۴ هرتز):
 * ۱) تندیس تعاملی مینیمال صفحه فرود (مسیر تبدیل ایده به ارزش — IDEA → IMPACT) بدون شلوغی ظاهری
 * ۲) شبیه‌ساز قیف فروش AIDA: جریان پیوسته سرازیرشونده از دهانه بالا تا خروجی پایین بدون خروج ذرات از دیواره قیف
 */

class PortalThreeScenes {
  constructor() {
    this.heroVisible = false;
    this.funnelVisible = false;
    this.discTexture = this.createSoftDiscTexture();

    this.initHeroSculpture3D();
    this.initFunnel3DScene();
    this.setupVisibilityObservers();
    this.refreshTheme();
    this.startUnifiedLoop();
  }

  damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }

  getPalette() {
    const theme = document.documentElement.getAttribute('data-theme') || 'paper';
    if (theme === 'carbon') {
      return {
        theme,
        isDark: true,
        accent: 0x38b2a6,
        warm: 0xdf8b57,
        danger: 0xe06363,
        neutral: 0x7c7970,
        grid: 0x3f5e53,
        slabFront: 0x25352f,
        slabBack: 0x121b18,
        plinthDisc: 0x1a2622,
        plinthBezel: 0x34d399,
        emblemInk: 0x34d399,
        emblemWarm: 0xf97316,
        emblemGold: 0xfbbf24,
        emblemCream: 0xf5efe2,
        emblemSecondary: 0x14b8a6,
        labelHex: '#6ee7b7',
        warmDotHex: '#fb923c'
      };
    }
    if (theme === 'contrast') {
      return {
        theme,
        isDark: true,
        accent: 0xfacc15,
        warm: 0x38bdf8,
        danger: 0xfb7185,
        neutral: 0xb5b5b5,
        grid: 0x787878,
        slabFront: 0x1f1f1f,
        slabBack: 0x3d3d3d,
        plinthDisc: 0x0d0d0d,
        plinthBezel: 0xfacc15,
        emblemInk: 0xfacc15,
        emblemWarm: 0xfb7185,
        emblemGold: 0x38bdf8,
        emblemCream: 0xffffff,
        emblemSecondary: 0x4ade80,
        labelHex: '#facc15',
        warmDotHex: '#38bdf8'
      };
    }
    if (theme === 'sepia') {
      return {
        theme,
        isDark: false,
        accent: 0x135e57,
        warm: 0x9e471c,
        danger: 0x992626,
        neutral: 0x7d6b5d,
        grid: 0xb8a382,
        slabFront: 0xe4d4b5,
        slabBack: 0xb59b73,
        plinthDisc: 0xfdf5e6,
        plinthBezel: 0x155746,
        emblemInk: 0x135946,
        emblemWarm: 0xc94e1a,
        emblemGold: 0xd98c1e,
        emblemCream: 0xfff3dc,
        emblemSecondary: 0x4f8468,
        labelHex: '#155746',
        warmDotHex: '#c94e1a'
      };
    }
    return {
      theme: 'paper',
      isDark: false,
      accent: 0x15614b,
      warm: 0xd45722,
      danger: 0xa62c2c,
      neutral: 0x8d897f,
      grid: 0x9ab594,
      slabFront: 0xd4e3c6,
      slabBack: 0x97b588,
      plinthDisc: 0xfefaf0,
      plinthBezel: 0x145c45,
      emblemInk: 0x116149,
      emblemWarm: 0xdc5822,
      emblemGold: 0xe39622,
      emblemCream: 0xfff5e2,
      emblemSecondary: 0x499675,
      labelHex: '#145c45',
      warmDotHex: '#dc5822'
    };
  }

  createSoftDiscTexture() {
    if (typeof THREE === 'undefined') return null;
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.88)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  showFallback(container, text) {
    if (!container) return;
    container.innerHTML = `
      <div class="w-full h-full flex items-center justify-center p-6 text-center">
        <span class="type-caption">${text}</span>
      </div>
    `;
  }

  setupVisibilityObservers() {
    if (typeof IntersectionObserver === 'undefined') {
      this.heroVisible = true;
      this.funnelVisible = true;
      return;
    }

    const heroWrap = document.getElementById('ec-hero-3d');
    if (heroWrap) {
      new IntersectionObserver(
        (entries) => {
          this.heroVisible = Boolean(entries[0]?.isIntersecting);
        },
        { threshold: 0.02 }
      ).observe(heroWrap);
    }

    const funnelWrap = document.getElementById('funnel-3d-canvas-wrap');
    if (funnelWrap) {
      new IntersectionObserver(
        (entries) => {
          this.funnelVisible = Boolean(entries[0]?.isIntersecting);
        },
        { threshold: 0.02 }
      ).observe(funnelWrap);
    }
  }

  /* ========================================================================
     ۱. تندیس سه‌بعدی تعاملی صفحه فرود
        پالت گرم و زنده در حالت‌های روشن و تیره، بدون کف شطرنجی،
        و ۴ ماکت سه‌بعدی مهندسی‌شده بدون هیچ‌گونه هم‌پوشانی یا تداخل اجزا
     ======================================================================== */
  _createRoundedRectShape(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  _createContactShadowTexture() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 6, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(20, 42, 32, 0.20)');
    g.addColorStop(0.45, 'rgba(20, 42, 32, 0.07)');
    g.addColorStop(1, 'rgba(20, 42, 32, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  _updateHeroFaceplateTexture(pal, stageIdx = this.activeHeroStage || 0) {
    if (!this.heroFaceCanvas) {
      this.heroFaceCanvas = document.createElement('canvas');
      this.heroFaceCanvas.width = 1024;
      this.heroFaceCanvas.height = 1120;
    }
    const ctx = this.heroFaceCanvas.getContext('2d');
    const W = 1024;
    const H = 1120;
    ctx.clearRect(0, 0, W, H);

    const strokeMain = pal.isDark ? 'rgba(110, 231, 183, 0.22)' : 'rgba(20, 92, 69, 0.14)';

    // کادر درونی نرم روی پلاک سرامیکی
    ctx.strokeStyle = strokeMain;
    ctx.lineWidth = 3;
    const pad = 58;
    const r = 132;
    ctx.beginPath();
    ctx.moveTo(pad + r, pad);
    ctx.lineTo(W - pad - r, pad);
    ctx.quadraticCurveTo(W - pad, pad, W - pad, pad + r);
    ctx.lineTo(W - pad, H - pad - r);
    ctx.quadraticCurveTo(W - pad, H - pad, W - pad - r, H - pad);
    ctx.lineTo(pad + r, H - pad);
    ctx.quadraticCurveTo(pad, H - pad, pad, H - pad - r);
    ctx.lineTo(pad, pad + r);
    ctx.quadraticCurveTo(pad, pad, pad + r, pad);
    ctx.closePath();
    ctx.stroke();

    // تایپوگرافی E-COMMERCE روی پلاک مرکزی
    ctx.fillStyle = pal.labelHex;
    ctx.font = '700 42px "JetBrains Mono", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = '11px';
      ctx.fillText('E-COMMERCE', W / 2 + 5, 892);
      ctx.letterSpacing = '0px';
    } else {
      ctx.fillText('E - C O M M E R C E', W / 2, 892);
    }

    // چهار نقطه نشانگر ایستگاه فعال روی پلاک
    const dotGap = 32;
    const startX = W / 2 - (dotGap * 3) / 2;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * dotGap;
      const y = 958;
      if (i === stageIdx) {
        ctx.fillStyle = pal.warmDotHex;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - 14, y - 5, 28, 10, 5);
        else ctx.rect(x - 14, y - 5, 28, 10);
        ctx.fill();
      } else {
        ctx.fillStyle = strokeMain;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!this.heroFaceTex) {
      this.heroFaceTex = new THREE.CanvasTexture(this.heroFaceCanvas);
      if (this.heroRenderer) {
        this.heroFaceTex.anisotropy = Math.min(8, this.heroRenderer.capabilities.getMaxAnisotropy());
      }
    }
    this.heroFaceTex.needsUpdate = true;
  }

  initHeroSculpture3D() {
    const wrap = document.getElementById('ec-hero-3d');
    if (!wrap) return;
    if (typeof THREE === 'undefined') {
      this.showFallback(wrap, 'E-COMMERCE');
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      this.showFallback(wrap, 'E-COMMERCE');
      return;
    }

    this.heroWrap = wrap;
    this.heroCardEl = document.getElementById('hero-journey-card') || wrap;
    this.heroScene = new THREE.Scene();

    const w = Math.max(wrap.clientWidth, 300);
    const h = Math.max(wrap.clientHeight, 300);

    this.heroCamera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
    this.heroCamera.position.set(0, 0.08, 9.0);
    this.heroCamera.lookAt(0, 0, 0);

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    wrap.innerHTML = '';
    wrap.appendChild(renderer.domElement);
    this.heroRenderer = renderer;

    // نورپردازی گرم و تطبیق‌پذیر با تم‌های روشن و تیره (بدون سفیدشدگی یا بی‌روحی رنگ‌ها)
    this.heroHemi = new THREE.HemisphereLight(0xfff9ec, 0xd8e0cc, 0.76);
    this.heroScene.add(this.heroHemi);

    this.heroKeyLight = new THREE.DirectionalLight(0xfff5e0, 0.68);
    this.heroKeyLight.position.set(-4.2, 6.8, 7.5);
    this.heroScene.add(this.heroKeyLight);

    this.heroRimLight = new THREE.DirectionalLight(0xffdfc2, 0.34);
    this.heroRimLight.position.set(5.2, -3.0, 4.8);
    this.heroScene.add(this.heroRimLight);

    this.heroRoot = new THREE.Group();
    this.heroScene.add(this.heroRoot);

    // سایه بسیار لطیف و نامحسوس زیر تندیس معلق (بدون هیچ کف شطرنجی)
    const shadowGeo = new THREE.PlaneGeometry(3.2, 1.35);
    this.heroShadowMat = new THREE.MeshBasicMaterial({
      map: this._createContactShadowTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    this.heroContactShadow = new THREE.Mesh(shadowGeo, this.heroShadowMat);
    this.heroContactShadow.rotation.x = -Math.PI / 2 + 0.18;
    this.heroContactShadow.position.set(0.14, -1.72, -0.15);
    this.heroRoot.add(this.heroContactShadow);

    // ۱. حلقه هاله پشت تندیس + مدار بیضوی کپسولی ضدپله و گوی‌های مداری گرم
    this.orbitGroup = new THREE.Group();
    this.heroRoot.add(this.orbitGroup);

    this.heroHaloMat = new THREE.MeshBasicMaterial({
      color: 0x9ab594,
      transparent: true,
      opacity: 0.38
    });
    const haloTorus = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.011, 14, 128), this.heroHaloMat);
    haloTorus.position.z = -0.62;
    this.orbitGroup.add(haloTorus);

    this.tiltedOrbitRig = new THREE.Group();
    this.tiltedOrbitRig.rotation.z = 0.35;
    this.tiltedOrbitRig.rotation.x = 1.14;
    this.orbitGroup.add(this.tiltedOrbitRig);

    const dashCount = 72;
    const rx = 3.42;
    const rz = 2.08;
    const dashBarGeo = new THREE.BoxGeometry(0.085, 0.016, 0.016);
    this.heroDashMat = new THREE.MeshBasicMaterial({
      color: 0x9ab594,
      transparent: true,
      opacity: 0.58
    });
    const dashInst = new THREE.InstancedMesh(dashBarGeo, this.heroDashMat, dashCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < dashCount; i++) {
      const a = (i / dashCount) * Math.PI * 2;
      const px = Math.cos(a) * rx;
      const pz = Math.sin(a) * rz;
      const tx = -Math.sin(a) * rx;
      const tz = Math.cos(a) * rz;
      dummy.position.set(px, 0, pz);
      dummy.rotation.set(0, -Math.atan2(tz, tx), 0);
      dummy.updateMatrix();
      dashInst.setMatrixAt(i, dummy.matrix);
    }
    dashInst.instanceMatrix.needsUpdate = true;
    this.tiltedOrbitRig.add(dashInst);

    this.heroWarmOrbMat = new THREE.MeshStandardMaterial({
      color: 0xdc5822,
      roughness: 0.3,
      metalness: 0.06
    });
    this.heroWarmOrb = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 28), this.heroWarmOrbMat);
    this.tiltedOrbitRig.add(this.heroWarmOrb);

    this.orbTrailPearls = [];
    const pearlGeo = new THREE.SphereGeometry(1, 14, 14);
    for (let t = 0; t < 5; t++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xdc5822,
        transparent: true,
        opacity: 0.42 * (1 - t / 5)
      });
      const pMesh = new THREE.Mesh(pearlGeo, pMat);
      const sc = 0.056 * (1 - t * 0.14);
      pMesh.scale.setScalar(sc);
      this.tiltedOrbitRig.add(pMesh);
      this.orbTrailPearls.push(pMesh);
    }

    this.heroSageOrbMat = new THREE.MeshStandardMaterial({
      color: 0x116149,
      roughness: 0.32,
      metalness: 0.06
    });
    this.heroSageOrb = new THREE.Mesh(new THREE.SphereGeometry(0.076, 22, 22), this.heroSageOrbMat);
    this.tiltedOrbitRig.add(this.heroSageOrb);

    this.orbitRx = rx;
    this.orbitRz = rz;
    this.warmOrbAngle = -1.85;
    this.warmOrbBoost = 0;

    // ۲. تندیس سرامیکی دولایه مرکزی + سکوی مدالیون برجسته
    this.slabGroup = new THREE.Group();
    this.heroBasePose = { x: -0.12, y: -0.24, z: 0.04 };
    this.slabGroup.rotation.set(this.heroBasePose.x, this.heroBasePose.y, this.heroBasePose.z);
    this.heroRoot.add(this.slabGroup);

    const tileW = 2.44;
    const tileH = 2.7;
    const tileShape = this._createRoundedRectShape(tileW, tileH, 0.44);
    const slabGeo = new THREE.ExtrudeGeometry(tileShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.065,
      bevelSize: 0.055,
      bevelSegments: 8,
      curveSegments: 32
    });
    slabGeo.center();

    this.frontSlabMat = new THREE.MeshStandardMaterial({
      color: 0xd4e3c6,
      roughness: 0.42,
      metalness: 0.02
    });
    this.frontSlab = new THREE.Mesh(slabGeo, this.frontSlabMat);
    this.slabGroup.add(this.frontSlab);

    this.backSlabMat = new THREE.MeshStandardMaterial({
      color: 0x97b588,
      roughness: 0.5,
      metalness: 0.02
    });
    this.backSlab = new THREE.Mesh(slabGeo, this.backSlabMat);
    this.backSlab.position.set(0.24, -0.22, -0.27);
    this.backSlab.scale.set(0.975, 0.975, 0.88);
    this.slabGroup.add(this.backSlab);

    this.activeHeroStage = 0;
    this._updateHeroFaceplateTexture(this.getPalette(), 0);
    const facePlaneGeo = new THREE.PlaneGeometry(tileW * 0.96, tileH * 0.96);
    const facePlaneMat = new THREE.MeshBasicMaterial({
      map: this.heroFaceTex,
      transparent: true,
      depthWrite: false
    });
    this.heroFaceMesh = new THREE.Mesh(facePlaneGeo, facePlaneMat);
    this.heroFaceMesh.position.set(0, 0, 0.16);
    this.slabGroup.add(this.heroFaceMesh);

    this.plinthDiscMat = new THREE.MeshStandardMaterial({
      color: 0xfefaf0,
      roughness: 0.36,
      metalness: 0.02
    });
    const plinthDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.79, 0.042, 64), this.plinthDiscMat);
    plinthDisc.rotation.x = Math.PI / 2;
    plinthDisc.position.set(0, 0.19, 0.165);
    this.slabGroup.add(plinthDisc);

    this.plinthBezelMat = new THREE.MeshStandardMaterial({
      color: 0x145c45,
      roughness: 0.32,
      metalness: 0.08
    });
    const plinthBezel = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.018, 18, 96), this.plinthBezelMat);
    plinthBezel.position.set(0, 0.19, 0.184);
    this.slabGroup.add(plinthBezel);

    // ۵ متریال گرم، اشباع و کاملاً سازگار با تم‌های روشن و تیره برای ۴ ماکت سه‌بعدی
    this.emblemInkMat = new THREE.MeshStandardMaterial({ color: 0x116149, roughness: 0.32, metalness: 0.08 });
    this.emblemWarmMat = new THREE.MeshStandardMaterial({ color: 0xdc5822, roughness: 0.3, metalness: 0.06 });
    this.emblemGoldMat = new THREE.MeshStandardMaterial({ color: 0xe39622, roughness: 0.3, metalness: 0.1 });
    this.emblemIvoryMat = new THREE.MeshStandardMaterial({ color: 0xfff5e2, roughness: 0.38, metalness: 0.02 });
    this.emblemSoftSageMat = new THREE.MeshStandardMaterial({ color: 0x499675, roughness: 0.36, metalness: 0.05 });
    this.loupeGlassMat = new THREE.MeshStandardMaterial({
      color: 0xdff7f0,
      transparent: true,
      opacity: 0.42,
      roughness: 0.12
    });

    // ۳. چهار ماکت سه‌بعدی با فواصل هندسی دقیق و بدون هیچ‌گونه فرو رفتن اجزا در یکدیگر
    this.emblemAnchor = new THREE.Group();
    this.emblemAnchor.position.set(0, 0.19, 0.36);
    this.slabGroup.add(this.emblemAnchor);

    /* ---------- ماکت ۰۱: جعبه توخالی بازشده با ۴ درِ تاخورده به بیرون + گوهر فرصت + ذره‌بین مجزا ---------- */
    const g0 = new THREE.Group();
    const parcelGroup = new THREE.Group();
    parcelGroup.position.set(-0.1, -0.09, 0);
    parcelGroup.rotation.set(0.34, 0.66, 0);

    const pW = 0.44;
    const pH = 0.33;
    const pD = 0.44;
    const wt = 0.028;

    // کف و چهار دیواره دقیق بدون هم‌پوشانی در گوشه‌ها
    const floorBox = new THREE.Mesh(new THREE.BoxGeometry(pW, wt, pD), this.emblemSoftSageMat);
    floorBox.position.y = -pH / 2 + wt / 2;
    const wallFront = new THREE.Mesh(new THREE.BoxGeometry(pW, pH - wt, wt), this.emblemIvoryMat);
    wallFront.position.set(0, wt / 2, pD / 2 - wt / 2);
    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(pW, pH - wt, wt), this.emblemIvoryMat);
    wallBack.position.set(0, wt / 2, -pD / 2 + wt / 2);
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(wt, pH - wt, pD - 2 * wt), this.emblemIvoryMat);
    wallLeft.position.set(-pW / 2 + wt / 2, wt / 2, 0);
    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(wt, pH - wt, pD - 2 * wt), this.emblemIvoryMat);
    wallRight.position.set(pW / 2 - wt / 2, wt / 2, 0);
    parcelGroup.add(floorBox, wallFront, wallBack, wallLeft, wallRight);

    // نوار بسته‌بندی سفالی روی بدنه جلو و برچسب سبز روی دیواره راست (با فاصله ایمن از سطح)
    const frontStripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.01), this.emblemWarmMat);
    frontStripe.position.set(0, -0.01, pD / 2 + 0.006);
    const sideBadge = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.11, 0.18), this.emblemInkMat);
    sideBadge.position.set(pW / 2 + 0.006, -0.03, 0);
    parcelGroup.add(frontStripe, sideBadge);

    // چهار لولای واقعی در لبه‌های بیرونی بالای جعبه که به سمت بیرون باز شده‌اند (بدون برخورد با بدنه یا یکدیگر)
    const flapLen = 0.13;
    const flapThick = 0.018;

    const pivotL = new THREE.Group();
    pivotL.position.set(-pW / 2, pH / 2, 0);
    const meshFlapL = new THREE.Mesh(new THREE.BoxGeometry(flapLen, flapThick, pD - 0.04), this.emblemGoldMat);
    meshFlapL.position.set(-flapLen / 2 - 0.004, 0, 0);
    pivotL.add(meshFlapL);
    pivotL.rotation.z = 0.54;

    const pivotR = new THREE.Group();
    pivotR.position.set(pW / 2, pH / 2, 0);
    const meshFlapR = new THREE.Mesh(new THREE.BoxGeometry(flapLen, flapThick, pD - 0.04), this.emblemGoldMat);
    meshFlapR.position.set(flapLen / 2 + 0.004, 0, 0);
    pivotR.add(meshFlapR);
    pivotR.rotation.z = -0.54;

    const pivotF = new THREE.Group();
    pivotF.position.set(0, pH / 2, pD / 2);
    const meshFlapF = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.04, flapThick, flapLen), this.emblemGoldMat);
    meshFlapF.position.set(0, 0, flapLen / 2 + 0.004);
    pivotF.add(meshFlapF);
    pivotF.rotation.x = 0.54;

    const pivotB = new THREE.Group();
    pivotB.position.set(0, pH / 2, -pD / 2);
    const meshFlapB = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.04, flapThick, flapLen), this.emblemGoldMat);
    meshFlapB.position.set(0, 0, -flapLen / 2 - 0.004);
    pivotB.add(meshFlapB);
    pivotB.rotation.x = -0.54;

    parcelGroup.add(pivotL, pivotR, pivotF, pivotB);

    // گوهر ایده و فرصت شناور در فضای کاملاً باز بالای دهانه جعبه
    const oppGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.115, 0), this.emblemWarmMat);
    oppGem.position.set(0, pH / 2 + 0.18, 0);
    parcelGroup.add(oppGem);
    this._heroOppGem = oppGem;

    // ذره‌بین کاوش مسئله در فضای آزاد جلو-راست (کاملاً جدا از مکعب جعبه)
    const loupeGroup = new THREE.Group();
    const loupeR = 0.14;
    const loupeTube = 0.022;
    const loupeRing = new THREE.Mesh(new THREE.TorusGeometry(loupeR, loupeTube, 18, 48), this.emblemInkMat);
    const loupeGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(loupeR - loupeTube + 0.002, loupeR - loupeTube + 0.002, 0.012, 32),
      this.loupeGlassMat
    );
    loupeGlass.rotation.x = Math.PI / 2;
    const handleLen = 0.17;
    const handleDist = loupeR + loupeTube + handleLen / 2 - 0.004;
    const loupeHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, handleLen, 16), this.emblemWarmMat);
    loupeHandle.position.set(handleDist * Math.SQRT1_2, -handleDist * Math.SQRT1_2, 0);
    loupeHandle.rotation.z = Math.PI / 4;
    loupeGroup.add(loupeRing, loupeGlass, loupeHandle);
    loupeGroup.position.set(0.34, 0.14, 0.25);
    loupeGroup.rotation.y = -0.22;
    g0.add(parcelGroup, loupeGroup);
    this._heroLoupe = loupeGroup;

    /* ---------- ماکت ۰۲: بوم مدل کسب‌وکار ۹ بخشی (BMC) با تفکیک رنگی گرم و برج ارزش پیشنهادی ---------- */
    const g1 = new THREE.Group();
    const bmcRig = new THREE.Group();
    bmcRig.rotation.set(0.48, -0.34, 0.05);

    const bmcBase = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.044, 0.78), this.emblemSoftSageMat);
    bmcRig.add(bmcBase);

    const bmcBlocks = [
      { x: -0.4, z: -0.11, w: 0.16, d: 0.43, h: 0.11, mat: this.emblemIvoryMat },
      { x: -0.2, z: -0.22, w: 0.16, d: 0.19, h: 0.13, mat: this.emblemIvoryMat },
      { x: -0.2, z: 0.0,   w: 0.16, d: 0.19, h: 0.1,  mat: this.emblemIvoryMat },
      { x: 0.0,  z: -0.11, w: 0.18, d: 0.43, h: 0.28, mat: this.emblemInkMat },
      { x: 0.2,  z: -0.22, w: 0.16, d: 0.19, h: 0.14, mat: this.emblemIvoryMat },
      { x: 0.2,  z: 0.0,   w: 0.16, d: 0.19, h: 0.11, mat: this.emblemIvoryMat },
      { x: 0.4,  z: -0.11, w: 0.16, d: 0.43, h: 0.19, mat: this.emblemGoldMat },
      { x: -0.25, z: 0.24, w: 0.45, d: 0.17, h: 0.09, mat: this.emblemIvoryMat },
      { x: 0.25,  z: 0.24, w: 0.45, d: 0.17, h: 0.16, mat: this.emblemWarmMat }
    ];
    bmcBlocks.forEach((b) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), b.mat);
      m.position.set(b.x, 0.022 + b.h / 2, b.z);
      bmcRig.add(m);
    });

    const vpHalo = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 14, 48), this.emblemGoldMat);
    vpHalo.position.set(0, 0.43, -0.11);
    vpHalo.rotation.x = Math.PI / 2.2;
    bmcRig.add(vpHalo);
    this._heroVpHalo = vpHalo;
    g1.add(bmcRig);

    /* ---------- ماکت ۰۳: معماری لایه‌باز سه‌بعدی وب‌اپلیکیشن (MVP) و استوانه دیتابیس ---------- */
    const g2 = new THREE.Group();
    const mvpRig = new THREE.Group();
    mvpRig.rotation.set(-0.16, 0.34, -0.03);

    const winShape = this._createRoundedRectShape(0.98, 0.68, 0.08);
    const winGeo = new THREE.ExtrudeGeometry(winShape, { depth: 0.036, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 });
    winGeo.center();
    const winBase = new THREE.Mesh(winGeo, this.emblemIvoryMat);
    winBase.position.z = -0.13;
    mvpRig.add(winBase);

    const winTopBar = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.02), this.emblemInkMat);
    winTopBar.position.set(0, 0.25, -0.09);
    mvpRig.add(winTopBar);

    const dotMats = [this.emblemWarmMat, this.emblemGoldMat, this.emblemSoftSageMat];
    [-0.38, -0.32, -0.26].forEach((dx, idx) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), dotMats[idx]);
      dot.position.set(dx, 0.25, -0.072);
      mvpRig.add(dot);
    });

    const uiLayerMid = new THREE.Group();
    uiLayerMid.position.z = 0.03;
    const uiSidebar = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.42, 0.028), this.emblemSoftSageMat);
    uiSidebar.position.set(0.32, -0.06, 0);
    const uiCard1 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.17, 0.028), this.emblemInkMat);
    uiCard1.position.set(-0.12, 0.06, 0);
    const uiCard2 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.028), this.emblemGoldMat);
    uiCard2.position.set(-0.22, -0.17, 0);
    uiLayerMid.add(uiSidebar, uiCard1, uiCard2);
    mvpRig.add(uiLayerMid);

    const uiLayerFront = new THREE.Group();
    uiLayerFront.position.z = 0.17;
    const ctaWidget = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.034), this.emblemWarmMat);
    ctaWidget.position.set(-0.18, -0.02, 0);
    uiLayerFront.add(ctaWidget);

    const dbStack = new THREE.Group();
    dbStack.position.set(0.26, -0.15, 0.02);
    dbStack.rotation.x = 0.2;
    [-0.072, 0, 0.072].forEach((dy, idx) => {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.105, 0.042, 28),
        idx === 2 ? this.emblemGoldMat : this.emblemInkMat
      );
      disc.position.y = dy;
      dbStack.add(disc);
    });
    uiLayerFront.add(dbStack);
    mvpRig.add(uiLayerFront);
    this._heroMvpFront = uiLayerFront;
    this._heroMvpMid = uiLayerMid;
    g2.add(mvpRig);

    /* ---------- ماکت ۰۴: سکوی تحویل نهایی + مدالیون تایید با تیک یکپارچه سه‌بعدی (✓) + ۳ ستون مجزای شاخص رشد ---------- */
    const g3 = new THREE.Group();
    const launchRig = new THREE.Group();
    launchRig.rotation.set(-0.08, -0.22, 0);

    // سکوی پایه مشترک بدون تداخل
    const launchBase = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.046, 0.4), this.emblemSoftSageMat);
    launchBase.position.set(0, -0.27, 0);
    launchRig.add(launchBase);

    // ناحیه چپ (x = -0.22): مدالیون دایره‌ای + قاب طلایی چسبان + تیک سه‌بعدی یکپارچه (ExtrudeGeometry)
    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(-0.22, 0.04, 0);

    const shieldDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.06, 40), this.emblemInkMat);
    shieldDisc.rotation.x = Math.PI / 2;
    badgeGroup.add(shieldDisc);

    const shieldRim = new THREE.Mesh(new THREE.TorusGeometry(0.258, 0.016, 18, 64), this.emblemGoldMat);
    badgeGroup.add(shieldRim);

    // چندضلعی بسته و یکپارچه علامت تیک (✓) بدون دو قطعه جدا یا هم‌پوشانی در زاویه شکست
    const chkShape = new THREE.Shape();
    chkShape.moveTo(-0.105, 0.005);
    chkShape.lineTo(-0.03, -0.07);
    chkShape.lineTo(0.115, 0.075);
    chkShape.lineTo(0.078, 0.112);
    chkShape.lineTo(-0.03, 0.004);
    chkShape.lineTo(-0.068, 0.042);
    chkShape.closePath();

    const chkGeo = new THREE.ExtrudeGeometry(chkShape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.004,
      bevelSegments: 3
    });
    const chkMesh = new THREE.Mesh(chkGeo, this.emblemIvoryMat);
    chkMesh.position.set(0, -0.015, 0.034);
    badgeGroup.add(chkMesh);
    launchRig.add(badgeGroup);

    // ناحیه راست (شروع از x = +0.16 با فاصله باز و کاملاً جدا از لبه +0.054 مدالیون): ۳ ستون صعودی عملکرد
    const barTopBaseY = -0.247;
    const barSpecs = [
      { x: 0.16, h: 0.2,  mat: this.emblemIvoryMat },
      { x: 0.29, h: 0.34, mat: this.emblemGoldMat },
      { x: 0.42, h: 0.49, mat: this.emblemWarmMat }
    ];
    barSpecs.forEach((b) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.088, b.h, 0.1), b.mat);
      bar.position.set(b.x, barTopBaseY + b.h / 2, 0);
      launchRig.add(bar);
    });

    // ستاره کوچک بالای بلندترین ستون بدون برخورد با لبه ستون
    const peakSpark = new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), this.emblemGoldMat);
    peakSpark.position.set(0.42, barTopBaseY + 0.49 + 0.095, 0);
    launchRig.add(peakSpark);
    this._heroPeakSpark = peakSpark;
    g3.add(launchRig);

    this.stageEmblems = [g0, g1, g2, g3];
    this.emblemScales = [1, 0.001, 0.001, 0.001];
    this.stageEmblems.forEach((grp, idx) => {
      const sc = idx === 0 ? 1 : 0.001;
      grp.scale.setScalar(sc);
      grp.visible = idx === 0;
      this.emblemAnchor.add(grp);
    });

    this.heroPtr = { x: 0, y: 0 };
    this.heroDrag = { active: false, moved: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 };
    this.heroImpulse = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      const rect = this.heroCardEl.getBoundingClientRect();
      if (this.heroDrag.active) {
        const dx = e.clientX - this.heroDrag.lastX;
        const dy = e.clientY - this.heroDrag.lastY;
        if (Math.abs(dx) + Math.abs(dy) > 4) this.heroDrag.moved = true;
        this.heroDrag.rotY = Math.max(-0.75, Math.min(0.75, this.heroDrag.rotY + dx * 0.007));
        this.heroDrag.rotX = Math.max(-0.48, Math.min(0.48, this.heroDrag.rotX + dy * 0.005));
        this.heroDrag.lastX = e.clientX;
        this.heroDrag.lastY = e.clientY;
        return;
      }
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        this.heroPtr.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        this.heroPtr.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      } else {
        this.heroPtr.x = 0;
        this.heroPtr.y = 0;
      }
    };

    wrap.addEventListener('pointerdown', (e) => {
      this.heroDrag.active = true;
      this.heroDrag.moved = false;
      this.heroDrag.lastX = e.clientX;
      this.heroDrag.lastY = e.clientY;
    });

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', () => {
      if (this.heroDrag.active && !this.heroDrag.moved) {
        window.stepHeroJourney?.();
      }
      this.heroDrag.active = false;
    });

    const onResize = () => {
      if (!this.heroWrap || !this.heroRenderer) return;
      const nw = this.heroWrap.clientWidth;
      const nh = this.heroWrap.clientHeight;
      if (nw < 20 || nh < 20) return;
      this.heroCamera.aspect = nw / nh;
      this.heroCamera.updateProjectionMatrix();
      this.heroRenderer.setSize(nw, nh);
    };

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(onResize).observe(wrap);
    } else {
      window.addEventListener('resize', onResize);
    }
  }

  setHeroStage(stageIdx = 0) {
    const next = ((Number(stageIdx) % 4) + 4) % 4;
    if (next !== this.activeHeroStage) {
      this.heroImpulse.y = (next > this.activeHeroStage ? 1 : -1) * 0.3;
      this.heroImpulse.x = -0.11;
      this.warmOrbBoost += 1.45;
    }
    this.activeHeroStage = next;
    if (this.heroFaceCanvas) {
      this._updateHeroFaceplateTexture(this.getPalette(), next);
    }
  }

  stepHeroSculpture(dt, elapsed) {
    if (!this.heroRenderer || !this.heroVisible) return;

    if (!this.heroDrag.active) {
      this.heroDrag.rotX = this.damp(this.heroDrag.rotX, 0, 3.8, dt);
      this.heroDrag.rotY = this.damp(this.heroDrag.rotY, 0, 3.8, dt);
    }

    this.heroImpulse.x = this.damp(this.heroImpulse.x, 0, 6.5, dt);
    this.heroImpulse.y = this.damp(this.heroImpulse.y, 0, 6.5, dt);

    const floatY = Math.sin(elapsed * 1.45) * 0.068;
    this.slabGroup.position.y = floatY;

    if (this.heroContactShadow) {
      const shScale = 1 - floatY * 0.4;
      this.heroContactShadow.scale.set(shScale, shScale, 1);
    }

    const stageTiltY = [-0.22, -0.06, 0.12, 0.24][this.activeHeroStage] || -0.22;
    const wantRotX = this.heroBasePose.x + this.heroPtr.y * 0.15 + this.heroDrag.rotX + this.heroImpulse.x;
    const wantRotY = stageTiltY + this.heroPtr.x * 0.22 + this.heroDrag.rotY + this.heroImpulse.y;
    const wantRotZ = this.heroBasePose.z - this.heroPtr.x * 0.035;

    this.slabGroup.rotation.x = this.damp(this.slabGroup.rotation.x, wantRotX, 8.5, dt);
    this.slabGroup.rotation.y = this.damp(this.slabGroup.rotation.y, wantRotY, 8.5, dt);
    this.slabGroup.rotation.z = this.damp(this.slabGroup.rotation.z, wantRotZ, 8.5, dt);

    this.backSlab.position.x = this.damp(this.backSlab.position.x, 0.24 - this.heroPtr.x * 0.075, 7, dt);
    this.backSlab.position.y = this.damp(this.backSlab.position.y, -0.22 + this.heroPtr.y * 0.075, 7, dt);

    for (let i = 0; i < this.stageEmblems.length; i++) {
      const grp = this.stageEmblems[i];
      const wantS = i === this.activeHeroStage ? 1 : 0.001;
      this.emblemScales[i] = this.damp(this.emblemScales[i], wantS, 10, dt);
      const sc = this.emblemScales[i];
      grp.scale.setScalar(sc);
      grp.visible = sc > 0.025;
      if (grp.visible) {
        grp.rotation.y = Math.sin(elapsed * 0.95 + i) * 0.1;
      }
    }

    if (this._heroOppGem) {
      this._heroOppGem.rotation.y += dt * 1.25;
      this._heroOppGem.position.y = 0.345 + Math.sin(elapsed * 2.6) * 0.025;
    }
    if (this._heroLoupe) {
      this._heroLoupe.position.y = 0.14 + Math.cos(elapsed * 2.0) * 0.022;
    }
    if (this._heroVpHalo) {
      this._heroVpHalo.rotation.z += dt * 0.9;
    }
    if (this._heroMvpFront && this._heroMvpMid) {
      this._heroMvpMid.position.z = 0.03 + Math.sin(elapsed * 2.1) * 0.015;
      this._heroMvpFront.position.z = 0.17 + Math.sin(elapsed * 2.1 + 0.5) * 0.024;
    }
    if (this._heroPeakSpark) {
      this._heroPeakSpark.rotation.y += dt * 1.4;
      this._heroPeakSpark.position.y = 0.338 + Math.sin(elapsed * 2.8) * 0.022;
    }

    this.orbitGroup.rotation.y = this.damp(this.orbitGroup.rotation.y, this.heroPtr.x * 0.085, 5, dt);
    this.orbitGroup.rotation.x = this.damp(this.orbitGroup.rotation.x, this.heroPtr.y * 0.065, 5, dt);

    this.warmOrbBoost = this.damp(this.warmOrbBoost, 0, 3.2, dt);
    this.warmOrbAngle += (0.28 + this.warmOrbBoost) * dt;
    this.heroWarmOrb.position.set(
      Math.cos(this.warmOrbAngle) * this.orbitRx,
      0,
      Math.sin(this.warmOrbAngle) * this.orbitRz
    );

    if (this.orbTrailPearls) {
      for (let t = 0; t < this.orbTrailPearls.length; t++) {
        const lagA = this.warmOrbAngle - (t + 1) * 0.085;
        this.orbTrailPearls[t].position.set(
          Math.cos(lagA) * this.orbitRx,
          0,
          Math.sin(lagA) * this.orbitRz
        );
      }
    }

    const sageAngle = this.warmOrbAngle + Math.PI * 1.02;
    this.heroSageOrb.position.set(
      Math.cos(sageAngle) * this.orbitRx,
      0,
      Math.sin(sageAngle) * this.orbitRz
    );

    this.heroRenderer.render(this.heroScene, this.heroCamera);
  }

  _extractRGB(hex) {
    return {
      r: ((hex >> 16) & 255) / 255,
      g: ((hex >> 8) & 255) / 255,
      b: (hex & 255) / 255
    };
  }

  /* ========================================================================
     ۲. شبیه‌ساز سه‌بعدی قیف فروش AIDA:
        جریان کاملاً محصور در درون قیف — سرازیر شدن از دهانه بالا (آگاهی)
        عبور لایه‌به‌لایه بر اساس نرخ تبدیل و خروج تراکنش‌ها از گلویی پایین
     ======================================================================== */
  initFunnel3DScene() {
    const wrap = document.getElementById('funnel-3d-canvas-wrap');
    if (!wrap) return;
    if (typeof THREE === 'undefined') {
      this.showFallback(wrap, 'موتور سه‌بعدی قیف در دسترس نیست.');
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      this.showFallback(wrap, 'WebGL در مرورگر غیرفعال است.');
      return;
    }

    this.fWrap = wrap;
    this.fScene = new THREE.Scene();
    const w = Math.max(wrap.clientWidth, 300);
    const h = Math.max(wrap.clientHeight, 260);

    this.fCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.fCamTargetPos = new THREE.Vector3(0, 1.45, 11.6);
    this.fCamLookTarget = new THREE.Vector3(0, -0.25, 0);
    this.fCamCurrentLook = new THREE.Vector3(0, -0.25, 0);
    this.fCamera.position.copy(this.fCamTargetPos);
    this.fCamera.lookAt(this.fCamCurrentLook);

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    wrap.innerHTML = '';
    wrap.appendChild(renderer.domElement);
    this.fRenderer = renderer;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a857b, 0.92);
    this.fScene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.68);
    dir.position.set(5, 8, 7);
    this.fScene.add(dir);

    this.targetFunnelParams = {
      rAwareness: 2.65,
      rInterest: 1.72,
      rDesire: 1.02,
      rAction: 0.46,
      vortexSpin: 1.5,
      dropSpeed: 1.9,
      activeRatio: 0.72,
      iProb: 0.45,
      dProb: 0.3,
      actProb: 0.2,
      coinScale: 1.0,
      bottleneckStage: 'desire'
    };
    this.currentFunnelParams = { ...this.targetFunnelParams };

    this.funnelGroup = new THREE.Group();
    this.fScene.add(this.funnelGroup);

    // بدنه پیوسته قیف شامل دهانه بالا + سه مقطع مخروطی نرم + گلویی خروجی پایین (از y=+2.8 تا y=-2.55)
    const funnelHeight = 5.35; // -2.55 .. +2.80
    const cylGeo = new THREE.CylinderGeometry(1, 1, funnelHeight, 48, 42, true);
    cylGeo.translate(0, 0.125, 0);
    this.funnelCylGeo = cylGeo;

    const pos = cylGeo.attributes.position;
    this.funnelBaseVerts = [];
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const angle = Math.atan2(vz, vx);
      this.funnelBaseVerts.push({
        y: vy,
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        isCap: Math.abs(vx) < 0.0001 && Math.abs(vz) < 0.0001
      });
    }

    this.funnelShellMat = new THREE.MeshStandardMaterial({
      color: 0x0d6b63,
      side: THREE.DoubleSide,
      roughness: 0.38,
      metalness: 0.08,
      transparent: true,
      opacity: 0.14,
      depthWrite: false
    });
    this.funnelShell = new THREE.Mesh(cylGeo, this.funnelShellMat);
    this.funnelGroup.add(this.funnelShell);

    this.funnelWireMat = new THREE.MeshBasicMaterial({
      color: 0x0d6b63,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    });
    this.funnelWire = new THREE.Mesh(cylGeo, this.funnelWireMat);
    this.funnelGroup.add(this.funnelWire);

    // ۴ حلقه مرحله‌ای AIDA + حلقه خروجی نازل پایین
    const levelDefs = [
      { key: 'rAwareness', y: 2.8, isSpout: false },
      { key: 'rInterest', y: 1.15, isSpout: false },
      { key: 'rDesire', y: -0.35, isSpout: false },
      { key: 'rAction', y: -1.65, isSpout: true },
      { key: 'rAction', y: -2.55, isSpout: true, scaleMult: 0.88 }
    ];
    this.levelRings = levelDefs.map((lvl) => {
      const rGeo = new THREE.TorusGeometry(1, 0.026, 14, 72);
      const rMat = new THREE.MeshStandardMaterial({
        color: lvl.isSpout ? 0xb45828 : 0x0d6b63,
        roughness: 0.35,
        transparent: true,
        opacity: 0.86
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = lvl.y;
      this.funnelGroup.add(ring);
      return { key: lvl.key, mesh: ring, mat: rMat, isSpout: lvl.isSpout, scaleMult: lvl.scaleMult || 1 };
    });

    // نشانگر گلوگاه اصلی ریزش
    const bnGeo = new THREE.TorusGeometry(1, 0.036, 14, 72);
    this.bottleneckRingMat = new THREE.MeshBasicMaterial({
      color: 0xa62c2c,
      transparent: true,
      opacity: 0.85
    });
    this.bottleneckRing = new THREE.Mesh(bnGeo, this.bottleneckRingMat);
    this.bottleneckRing.rotation.x = Math.PI / 2;
    this.funnelGroup.add(this.bottleneckRing);

    // حوضچه جمع‌آوری تراکنش‌های نهایی در زیر گلویی قیف (y = -3.15)
    const basinGroup = new THREE.Group();
    basinGroup.position.y = -3.15;
    this.basinDiscMat = new THREE.MeshBasicMaterial({
      color: 0xb45828,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    this.basinDisc = new THREE.Mesh(new THREE.CircleGeometry(1, 48), this.basinDiscMat);
    this.basinDisc.rotation.x = -Math.PI / 2;
    basinGroup.add(this.basinDisc);

    this.basinRimMat = new THREE.MeshBasicMaterial({
      color: 0xb45828,
      transparent: true,
      opacity: 0.75
    });
    this.basinRim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 12, 64), this.basinRimMat);
    this.basinRim.rotation.x = Math.PI / 2;
    basinGroup.add(this.basinRim);
    this.basinGroup = basinGroup;
    this.funnelGroup.add(basinGroup);

    // ذرات جریان قیف با شیدر اختصاصی برای کنترل دقیق اندازه و محو شدن درونی (بدون خروج حتی یک ذره از دیواره)
    this.maxVortexParticles = 520;
    const golden = 0.61803398875;
    this.vortexData = Array.from({ length: this.maxVortexParticles }, (_, idx) => ({
      y: -3.1 + ((idx * 0.0137) % 1) * 6.45,
      angle: idx * 2.39996,
      speedFactor: 0.86 + (idx % 7) * 0.045,
      // فاصله شعاعی نرمال حداکثر ۰.۷۴ شعاع قیف تا همیشه داخل دیواره بماند
      radialLane: 0.1 + ((idx * golden) % 1) * 0.64,
      uI: ((idx * golden + 0.13) % 1),
      uD: ((idx * golden * 1.7 + 0.29) % 1),
      uAct: ((idx * golden * 2.3 + 0.47) % 1)
    }));

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.maxVortexParticles * 3), 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(this.maxVortexParticles * 3), 3));
    pGeo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(this.maxVortexParticles), 1));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(this.maxVortexParticles), 1));

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    this.pShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: pixelRatio }
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aAlpha;
        attribute float aSize;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = aSize * uPixelRatio * (135.0 / max(1.0, -mvPosition.z));
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float r2 = dot(cxy, cxy);
          if (r2 > 1.0 || vAlpha <= 0.01) discard;
          float soft = 1.0 - smoothstep(0.28, 1.0, r2);
          gl_FragColor = vec4(vColor, vAlpha * soft);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.vortexPoints = new THREE.Points(pGeo, this.pShaderMat);
    this.funnelGroup.add(this.vortexPoints);

    this.fDragging = false;
    this.fLastPtr = { x: 0, y: 0 };
    this.fRot = { x: 0.08, y: 0 };
    this.fVelY = 0.2;

    wrap.addEventListener('pointerdown', (e) => {
      this.fDragging = true;
      this.fLastPtr.x = e.clientX;
      this.fLastPtr.y = e.clientY;
    });
    window.addEventListener(
      'pointermove',
      (e) => {
        if (!this.fDragging) return;
        const dx = e.clientX - this.fLastPtr.x;
        const dy = e.clientY - this.fLastPtr.y;
        this.fVelY = dx * 0.1;
        this.fRot.y += dx * 0.007;
        this.fRot.x = Math.max(-0.35, Math.min(0.45, this.fRot.x + dy * 0.004));
        this.fLastPtr.x = e.clientX;
        this.fLastPtr.y = e.clientY;
      },
      { passive: true }
    );
    window.addEventListener('pointerup', () => {
      this.fDragging = false;
    });

    const onResize = () => {
      if (!this.fWrap || !this.fRenderer) return;
      const nw = this.fWrap.clientWidth;
      const nh = this.fWrap.clientHeight;
      if (nw < 20 || nh < 20) return;
      this.fCamera.aspect = nw / nh;
      this.fCamera.updateProjectionMatrix();
      this.fRenderer.setSize(nw, nh);
    };

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(onResize).observe(wrap);
    } else {
      window.addEventListener('resize', onResize);
    }
  }

  _smoothInterp(a, b, t) {
    const clamped = Math.min(1, Math.max(0, t));
    const s = 0.5 - 0.5 * Math.cos(Math.PI * clamped);
    return a + (b - a) * s;
  }

  getFunnelRadiusAtY(y, params = this.currentFunnelParams) {
    const { rAwareness, rInterest, rDesire, rAction } = params;
    if (y >= 2.8) {
      return rAwareness;
    }
    if (y >= 1.15) {
      return this._smoothInterp(rInterest, rAwareness, (y - 1.15) / (2.8 - 1.15));
    }
    if (y >= -0.35) {
      return this._smoothInterp(rDesire, rInterest, (y - -0.35) / (1.15 - -0.35));
    }
    if (y >= -1.65) {
      return this._smoothInterp(rAction, rDesire, (y - -1.65) / (-0.35 - -1.65));
    }
    // گلویی باریک خروجی قیف در پایین (-1.65 تا -2.55)
    const tSpout = Math.min(1, Math.max(0, (-1.65 - y) / 0.9));
    return rAction * (1 - tSpout * 0.12);
  }

  stepFunnel(dt, elapsed) {
    if (!this.fRenderer || !this.funnelVisible) return;

    const cur = this.currentFunnelParams;
    const tgt = this.targetFunnelParams;
    const keys = ['rAwareness', 'rInterest', 'rDesire', 'rAction', 'vortexSpin', 'dropSpeed', 'activeRatio', 'coinScale'];
    let needsVertUpdate = false;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const next = this.damp(cur[k], tgt[k], 9, dt);
      if (Math.abs(next - cur[k]) > 0.0004) {
        cur[k] = next;
        if (k.startsWith('r')) needsVertUpdate = true;
      }
    }
    cur.iProb = this.damp(cur.iProb, tgt.iProb, 10, dt);
    cur.dProb = this.damp(cur.dProb, tgt.dProb, 10, dt);
    cur.actProb = this.damp(cur.actProb, tgt.actProb, 10, dt);
    cur.bottleneckStage = tgt.bottleneckStage;

    for (let i = 0; i < this.levelRings.length; i++) {
      const lr = this.levelRings[i];
      const r = Math.max(0.16, cur[lr.key] * lr.scaleMult);
      lr.mesh.scale.set(r, r, 1);
    }

    const basinScale = Math.max(0.55, cur.rAction * 1.45 + 0.25);
    if (this.basinGroup) {
      this.basinGroup.scale.set(basinScale, 1, basinScale);
    }

    if (needsVertUpdate || !this._funnelVertsReady) {
      this._funnelVertsReady = true;
      const posAttr = this.funnelCylGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const bv = this.funnelBaseVerts[i];
        if (bv.isCap) continue;
        const r = this.getFunnelRadiusAtY(bv.y, cur);
        posAttr.setX(i, bv.cos * r);
        posAttr.setZ(i, bv.sin * r);
      }
      posAttr.needsUpdate = true;
      this.funnelCylGeo.computeVertexNormals();
    }

    if (!this.fDragging) {
      this.fVelY = this.damp(this.fVelY, 0.16, 4, dt);
      this.fRot.y += this.fVelY * dt;
    }
    this.funnelGroup.rotation.y = this.damp(this.funnelGroup.rotation.y, this.fRot.y, 12, dt);
    this.funnelGroup.rotation.x = this.damp(this.funnelGroup.rotation.x, this.fRot.x, 10, dt);

    const pulse = 1.03 + Math.sin(elapsed * 3.0) * 0.025;
    const bnKey = cur.bottleneckStage === 'interest' ? 'rInterest' : cur.bottleneckStage === 'action' ? 'rAction' : 'rDesire';
    const bnY = bnKey === 'rInterest' ? 1.15 : bnKey === 'rAction' ? -1.65 : -0.35;
    const bnR = cur[bnKey] * pulse;
    this.bottleneckRing.position.y = bnY;
    this.bottleneckRing.scale.set(bnR, bnR, 1);
    this.bottleneckRingMat.opacity = 0.55 + Math.sin(elapsed * 3.0) * 0.28;

    this.updateFunnelParticles(dt);

    this.fCamera.position.x = this.damp(this.fCamera.position.x, this.fCamTargetPos.x, 6, dt);
    this.fCamera.position.y = this.damp(this.fCamera.position.y, this.fCamTargetPos.y, 6, dt);
    this.fCamera.position.z = this.damp(this.fCamera.position.z, this.fCamTargetPos.z, 6, dt);
    this.fCamCurrentLook.x = this.damp(this.fCamCurrentLook.x, this.fCamLookTarget.x, 6, dt);
    this.fCamCurrentLook.y = this.damp(this.fCamCurrentLook.y, this.fCamLookTarget.y, 6, dt);
    this.fCamCurrentLook.z = this.damp(this.fCamCurrentLook.z, this.fCamLookTarget.z, 6, dt);
    this.fCamera.lookAt(this.fCamCurrentLook);

    this.fRenderer.render(this.fScene, this.fCamera);
  }

  updateFunnelGeometry(traffic, interestRate, desireRate, actionRate, revPerOrder = 250000) {
    if (!this.fScene) return;

    const rA = 1.85 + (traffic / 50000) * 1.45;
    const rI = Math.max(0.85, rA * (0.34 + (interestRate / 100) * 0.48));
    const rD = Math.max(0.46, rI * (0.34 + (desireRate / 100) * 0.48));
    const rAct = Math.max(0.24, rD * (0.32 + (actionRate / 100) * 0.48));

    this.targetFunnelParams.rAwareness = rA;
    this.targetFunnelParams.rInterest = rI;
    this.targetFunnelParams.rDesire = rD;
    this.targetFunnelParams.rAction = rAct;

    this.targetFunnelParams.dropSpeed = 1.65 + (actionRate / 100) * 1.1;
    this.targetFunnelParams.vortexSpin = 1.15 + (interestRate / 100) * 1.2;
    this.targetFunnelParams.activeRatio = 0.42 + (traffic / 50000) * 0.58;
    this.targetFunnelParams.iProb = interestRate / 100;
    this.targetFunnelParams.dProb = desireRate / 100;
    this.targetFunnelParams.actProb = actionRate / 100;
    this.targetFunnelParams.coinScale = 0.92 + (revPerOrder / 2000000) * 0.38;

    if (interestRate <= desireRate && interestRate <= actionRate) {
      this.targetFunnelParams.bottleneckStage = 'interest';
    } else if (desireRate <= interestRate && desireRate <= actionRate) {
      this.targetFunnelParams.bottleneckStage = 'desire';
    } else {
      this.targetFunnelParams.bottleneckStage = 'action';
    }
  }

  setFunnelView(preset = 'iso') {
    if (!this.fCamera) return;
    if (preset === 'top') {
      this.fCamTargetPos.set(0, 10.4, 3.6);
      this.fCamLookTarget.set(0, 0.1, 0);
    } else if (preset === 'bottleneck') {
      const bnY =
        this.targetFunnelParams.bottleneckStage === 'interest'
          ? 1.15
          : this.targetFunnelParams.bottleneckStage === 'action'
            ? -1.65
            : -0.35;
      this.fCamTargetPos.set(0, bnY + 1.0, 6.9);
      this.fCamLookTarget.set(0, bnY - 0.15, 0);
    } else {
      this.fCamTargetPos.set(0, 1.45, 11.6);
      this.fCamLookTarget.set(0, -0.25, 0);
    }
  }

  updateFunnelParticles(dt) {
    const geo = this.vortexPoints.geometry;
    const positions = geo.attributes.position.array;
    const colors = geo.attributes.aColor.array;
    const alphas = geo.attributes.aAlpha.array;
    const sizes = geo.attributes.aSize.array;

    const cur = this.currentFunnelParams;
    const pal = this.getPalette();

    const cAware = this._extractRGB(pal.accent);
    const cMid = this._extractRGB(pal.neutral);
    const cOrder = this._extractRGB(pal.warm);
    const cDrop = this._extractRGB(pal.danger);

    const activeCount = Math.floor(this.maxVortexParticles * cur.activeRatio);
    geo.setDrawRange(0, activeCount);

    // آستانه‌های بصری متناسب با نرخ واقعی تا تراکم در هر طبقه دقیقاً کاهش یابد ولی جریان خروجی کاملاً دیده شود
    const visI = 0.12 + cur.iProb * 0.88;
    const visD = 0.16 + cur.dProb * 0.84;
    const visAct = 0.2 + cur.actProb * 0.8;

    const topSpawnY = 3.35;
    const bottomBasinY = -3.14;

    for (let i = 0; i < activeCount; i++) {
      const p = this.vortexData[i];
      const idx3 = i * 3;

      // تعیین عمیق‌ترین مرحله‌ای که این کاربر مجاز به عبور از آن است
      let stopY = bottomBasinY;
      let isConverted = true;
      if (p.uI > visI) {
        stopY = 1.18;
        isConverted = false;
      } else if (p.uD > visD) {
        stopY = -0.32;
        isConverted = false;
      } else if (p.uAct > visAct) {
        stopY = -1.62;
        isConverted = false;
      }

      const wallR = this.getFunnelRadiusAtY(Math.min(2.8, Math.max(-2.55, p.y)), cur);

      // سرعت سرازیر شدن به سمت پایین (سریع‌تر در گلویی باریک بر اساس پیوستگی جریان)
      let fallSpeed = cur.dropSpeed * p.speedFactor;
      if (p.y < -1.65) {
        fallSpeed *= 1.38; // خروج مستقیم و پرسرعت از نازل پایین به داخل تشتک
      } else if (!isConverted && p.y - stopY < 0.48) {
        fallSpeed *= 0.58; // کند شدن ملایم کاربران ریزشی در پشت فیلتر همان مرحله
      }

      p.y -= fallSpeed * dt;

      if (p.y <= stopY) {
        p.y = topSpawnY - Math.random() * 0.22;
      }

      // چرخش آرام در بالای قیف و تبدیل به جریان عمودی مستقیم در گلویی پایین
      const spinFactor = p.y < -1.65 ? 0.25 : 1.0 / Math.max(0.45, wallR * 0.75);
      p.angle += cur.vortexSpin * spinFactor * p.speedFactor * dt;

      // محاسبه شعاع دقیقاً در درون دیواره قیف (حداکثر ۷۴٪ شعاع دیواره تا هرگز بیرون نزند)
      let r;
      if (p.y > 2.8) {
        // ورود متمرکز آبشاری از دهانه بالای قیف
        const tIn = Math.min(1, (p.y - 2.8) / (topSpawnY - 2.8));
        const mouthR = cur.rAwareness * p.radialLane;
        r = mouthR * (1 - tIn * 0.35);
      } else if (p.y >= -2.55) {
        r = wallR * p.radialLane;
      } else {
        // جت عمودی خروجی از نازل پایین مستقیماً به مرکز حوضچه تراکنش‌ها
        const spoutExitR = cur.rAction * 0.88 * 0.62;
        r = spoutExitR * p.radialLane;
      }

      positions[idx3] = Math.cos(p.angle) * r;
      positions[idx3 + 1] = p.y;
      positions[idx3 + 2] = Math.sin(p.angle) * r;

      // شفافیت و اندازه هر ذره (محو شدن نرم ریزش‌ها در درون قیف بدون خروج از دیواره)
      let alpha = 0.92;
      let pSize = 0.21 * cur.coinScale;
      let col = cAware;

      if (p.y > 2.8) {
        alpha = Math.max(0, 1 - (p.y - 2.8) / (topSpawnY - 2.8)) * 0.88;
        col = cAware;
      } else if (!isConverted && p.y - stopY < 0.45) {
        const fade = Math.max(0, (p.y - stopY) / 0.45);
        alpha = fade * 0.8;
        pSize *= 0.65 + 0.35 * fade;
        col = cDrop;
      } else if (p.y >= 1.15) {
        col = cAware;
      } else if (p.y >= -0.35) {
        col = {
          r: (cAware.r + cMid.r) * 0.5,
          g: (cAware.g + cMid.g) * 0.5,
          b: (cAware.b + cMid.b) * 0.5
        };
      } else if (p.y >= -1.65) {
        col = cMid;
      } else {
        // مشتریان نهایی تبدیل‌شده در گلویی اقدام و خروجی پایین
        col = cOrder;
        pSize = 0.28 * cur.coinScale;
        alpha = p.y < -2.95 ? Math.max(0, (p.y - bottomBasinY) / 0.2) : 0.98;
      }

      colors[idx3] = col.r;
      colors[idx3 + 1] = col.g;
      colors[idx3 + 2] = col.b;
      alphas[i] = alpha;
      sizes[i] = pSize;
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.aColor.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
  }

  refreshTheme() {
    const pal = this.getPalette();

    // تنظیم پویای نورپردازی برای درخشش گرم در تم‌های روشن و وضوح جواهرگونه در تم‌های تیره
    if (this.heroHemi) {
      this.heroHemi.color.setHex(pal.isDark ? 0xeafaf3 : 0xfff9eb);
      this.heroHemi.groundColor.setHex(pal.isDark ? 0x22332d : 0xd8e0cc);
      this.heroHemi.intensity = pal.isDark ? 0.92 : 0.78;
    }
    if (this.heroKeyLight) {
      this.heroKeyLight.color.setHex(pal.isDark ? 0xfff8eb : 0xfff4de);
      this.heroKeyLight.intensity = pal.isDark ? 0.85 : 0.68;
    }
    if (this.heroRimLight) {
      this.heroRimLight.color.setHex(pal.isDark ? pal.accent : 0xffdfc2);
      this.heroRimLight.intensity = pal.isDark ? 0.52 : 0.34;
    }

    if (this.frontSlabMat) this.frontSlabMat.color.setHex(pal.slabFront);
    if (this.backSlabMat) this.backSlabMat.color.setHex(pal.slabBack);
    if (this.plinthDiscMat) this.plinthDiscMat.color.setHex(pal.plinthDisc);
    if (this.plinthBezelMat) {
      this.plinthBezelMat.color.setHex(pal.plinthBezel);
      this.plinthBezelMat.emissive.setHex(pal.isDark ? pal.plinthBezel : 0x000000);
      this.plinthBezelMat.emissiveIntensity = pal.isDark ? 0.16 : 0;
    }

    if (this.emblemInkMat) {
      this.emblemInkMat.color.setHex(pal.emblemInk);
      this.emblemInkMat.emissive.setHex(pal.isDark ? pal.emblemInk : 0x000000);
      this.emblemInkMat.emissiveIntensity = pal.isDark ? 0.16 : 0;
    }
    if (this.emblemWarmMat) {
      this.emblemWarmMat.color.setHex(pal.emblemWarm);
      this.emblemWarmMat.emissive.setHex(pal.isDark ? pal.emblemWarm : 0x000000);
      this.emblemWarmMat.emissiveIntensity = pal.isDark ? 0.18 : 0;
    }
    if (this.emblemGoldMat) {
      this.emblemGoldMat.color.setHex(pal.emblemGold);
      this.emblemGoldMat.emissive.setHex(pal.isDark ? pal.emblemGold : 0x000000);
      this.emblemGoldMat.emissiveIntensity = pal.isDark ? 0.16 : 0;
    }
    if (this.emblemIvoryMat) {
      this.emblemIvoryMat.color.setHex(pal.emblemCream);
      this.emblemIvoryMat.emissive.setHex(pal.isDark ? pal.emblemCream : 0x000000);
      this.emblemIvoryMat.emissiveIntensity = pal.isDark ? 0.08 : 0;
    }
    if (this.emblemSoftSageMat) {
      this.emblemSoftSageMat.color.setHex(pal.emblemSecondary);
      this.emblemSoftSageMat.emissive.setHex(pal.isDark ? pal.emblemSecondary : 0x000000);
      this.emblemSoftSageMat.emissiveIntensity = pal.isDark ? 0.14 : 0;
    }
    if (this.loupeGlassMat) {
      this.loupeGlassMat.color.setHex(pal.isDark ? 0x99f6e4 : 0xdff7f0);
      this.loupeGlassMat.opacity = pal.isDark ? 0.48 : 0.42;
    }
    if (this.heroShadowMat) {
      this.heroShadowMat.opacity = pal.isDark ? 0.35 : 0.55;
    }

    if (this.heroHaloMat) {
      this.heroHaloMat.color.setHex(pal.grid);
      this.heroHaloMat.opacity = pal.isDark ? 0.48 : 0.38;
    }
    if (this.heroDashMat) {
      this.heroDashMat.color.setHex(pal.grid);
      this.heroDashMat.opacity = pal.isDark ? 0.72 : 0.58;
    }
    if (this.heroWarmOrbMat) {
      this.heroWarmOrbMat.color.setHex(pal.emblemWarm);
      this.heroWarmOrbMat.emissive.setHex(pal.isDark ? pal.emblemWarm : 0x000000);
      this.heroWarmOrbMat.emissiveIntensity = pal.isDark ? 0.25 : 0;
    }
    if (this.orbTrailPearls) {
      this.orbTrailPearls.forEach((p) => p.material.color.setHex(pal.emblemWarm));
    }
    if (this.heroSageOrbMat) {
      this.heroSageOrbMat.color.setHex(pal.emblemInk);
      this.heroSageOrbMat.emissive.setHex(pal.isDark ? pal.emblemInk : 0x000000);
      this.heroSageOrbMat.emissiveIntensity = pal.isDark ? 0.2 : 0;
    }
    if (this.heroFaceCanvas) {
      this._updateHeroFaceplateTexture(pal, this.activeHeroStage || 0);
    }

    if (this.funnelShellMat) {
      this.funnelShellMat.color.setHex(pal.accent);
      this.funnelShellMat.opacity = pal.isDark ? 0.16 : 0.12;
    }
    if (this.funnelWireMat) {
      this.funnelWireMat.color.setHex(pal.accent);
      this.funnelWireMat.opacity = pal.isDark ? 0.2 : 0.14;
    }
    if (this.levelRings) {
      this.levelRings.forEach((lr) => lr.mat.color.setHex(lr.isSpout ? pal.warm : pal.accent));
    }
    if (this.bottleneckRingMat) {
      this.bottleneckRingMat.color.setHex(pal.danger);
    }
    if (this.basinDiscMat) this.basinDiscMat.color.setHex(pal.warm);
    if (this.basinRimMat) this.basinRimMat.color.setHex(pal.warm);
  }

  resizeAll() {
    if (this.heroWrap && this.heroRenderer && this.heroWrap.clientWidth > 20 && this.heroWrap.clientHeight > 20) {
      this.heroCamera.aspect = this.heroWrap.clientWidth / this.heroWrap.clientHeight;
      this.heroCamera.updateProjectionMatrix();
      this.heroRenderer.setSize(this.heroWrap.clientWidth, this.heroWrap.clientHeight);
    }
    if (this.fWrap && this.fRenderer && this.fWrap.clientWidth > 20 && this.fWrap.clientHeight > 20) {
      this.fCamera.aspect = this.fWrap.clientWidth / this.fWrap.clientHeight;
      this.fCamera.updateProjectionMatrix();
      this.fRenderer.setSize(this.fWrap.clientWidth, this.fWrap.clientHeight);
    }
  }

  startUnifiedLoop() {
    let lastTime = performance.now();
    let elapsed = 0;

    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
      lastTime = now;
      elapsed += dt;

      if (this.heroVisible) this.stepHeroSculpture(dt, elapsed);
      if (this.funnelVisible) this.stepFunnel(dt, elapsed);
    };

    requestAnimationFrame(tick);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.portalThree = new PortalThreeScenes();
});
