/**
 * محرك المشاهد ثلاثية الأبعاد لبوابة مشروع التجارة الإلكترونية (Three.js WebGL)
 * 1. النواة الفضائية التفاعلية (360° Spatial Core & Scrollytelling)
 * 2. محاكي قمع التسويق ثلاثي الأبعاد (AIDA Vortex Funnel) مع تدفق عمودي للأسفل وتحديث هندسي لحظي
 */

class PortalThreeScenes {
  constructor() {
    this.initGlobalCoreScene();
    this.initFunnel3DScene();
  }

  /* ========================================================================
     1. المشهد الفضائي العام (Global Scrollytelling Spatial Core)
     ======================================================================== */
  initGlobalCoreScene() {
    const container = document.getElementById('global-webgl-container');
    if (!container || typeof THREE === 'undefined') return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 18);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);

    // النواة الهندسية المركزية
    const icoGeo = new THREE.IcosahedronGeometry(4.0, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });
    this.icoMesh = new THREE.Mesh(icoGeo, icoMat);
    this.coreGroup.add(this.icoMesh);

    // الحلقات المدارية الأربع الممثلة لمراحل المشروع الأربع
    this.rings = [];
    const ringColors = [0x06b6d4, 0x6366f1, 0xd946ef, 0x10b981];
    ringColors.forEach((col, idx) => {
      const torusGeo = new THREE.TorusGeometry(5.8 + idx * 1.35, 0.035, 16, 100);
      const torusMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.42
      });
      const ring = new THREE.Mesh(torusGeo, torusMat);
      ring.rotation.x = (Math.PI / 4) * idx;
      ring.rotation.y = (Math.PI / 6) * idx;
      this.coreGroup.add(ring);
      this.rings.push(ring);
    });

    // حقل الجسيمات الفضائية المحيطة
    const partCount = 850;
    const positions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 44;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.11,
      transparent: true,
      opacity: 0.6
    });
    this.particleSystem = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particleSystem);

    // التفاعل الحر بزاوية 360 درجة عبر السحب بالماوس أو اللمس
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0.2, y: 0.4 };

    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, textarea, select, a, table, .glass-card, .ergonomic-dock-br')) return;
      this.isDragging = true;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.targetRotation.y += dx * 0.0065;
      this.targetRotation.x += dy * 0.0065;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const animateGlobal = () => {
      requestAnimationFrame(animateGlobal);
      this.targetRotation.y += 0.0015;
      this.coreGroup.rotation.y += (this.targetRotation.y - this.coreGroup.rotation.y) * 0.08;
      this.coreGroup.rotation.x += (this.targetRotation.x - this.coreGroup.rotation.x) * 0.08;

      this.rings.forEach((r, i) => {
        r.rotation.z += 0.0018 * (i + 1);
      });
      this.particleSystem.rotation.y -= 0.0005;

      this.renderer.render(this.scene, this.camera);
    };
    animateGlobal();
  }

  TransitionToStage(stageNumber) {
    if (!this.camera || typeof gsap === 'undefined') return;
    const zPositions = [18, 15, 16.5, 13.5, 14.5, 17, 15, 16, 14, 12.5];
    const targetZ = zPositions[stageNumber] || 16;
    gsap.to(this.camera.position, {
      z: targetZ,
      duration: 1.1,
      ease: 'power2.out'
    });
    this.targetRotation.y += 0.4;
  }

  /* ========================================================================
     2. محاكي قمع التسويق ثلاثي الأبعاد (AIDA 3D Vortex Funnel)
     مع حركة حلزونية مستمرة للأسفل واستجابة هندسية وبصرية فورية للمدخلات
     ======================================================================== */
  initFunnel3DScene() {
    const wrap = document.getElementById('funnel-3d-canvas-wrap');
    if (!wrap || typeof THREE === 'undefined') return;

    this.fScene = new THREE.Scene();
    this.fCamera = new THREE.PerspectiveCamera(48, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    this.fCamera.position.set(0, 1.8, 12.2);
    this.fCamera.lookAt(0, -0.4, 0);

    this.fRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.fRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    this.fRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(this.fRenderer.domElement);

    // المعاملات الهندسية والفيزيائية للقمع التي تتحدث مباشرة مع المدخلات
    this.funnelParams = {
      rAwareness: 3.1,      // نصف قطر فوهة الوعي (أعلى القمع y = +2.8)
      rInterest: 2.0,       // نصف قطر مستوى الاهتمام (y = +1.0)
      rDesire: 1.15,        // نصف قطر عنق الرغبة (y = -0.6)
      rAction: 0.55,        // نصف قطر مخرج الإجراء والشراء (y = -2.1)
      vortexSpin: 0.045,    // سرعة الدوران الحلزوني
      dropSpeed: 0.038,     // سرعة التدفق العمودي نحو الأسفل
      activeRatio: 0.65,    // نسبة الجسيمات الفعالة حسب حجم الزوار
      conversionRatio: 0.25,// نسبة الجسيمات التي تعبر عنق القمع وتتحول لعملات ذهبية
      coinScale: 0.24       // حجم جسيمات العملات حسب قيمة العائد
    };

    this.funnelGroup = new THREE.Group();
    this.fScene.add(this.funnelGroup);

    // بناء شبكة القمع والحلقات الدلالية للمستويات الأربعة
    this.stageRings = [];
    this.buildFunnelMesh();

    // نظام الجسيمات المتدفقة من الأعلى إلى الأسفل (600 جسيم)
    this.maxVortexParticles = 600;
    this.vortexData = [];
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(this.maxVortexParticles * 3);
    const pCol = new Float32Array(this.maxVortexParticles * 3);

    for (let i = 0; i < this.maxVortexParticles; i++) {
      this.vortexData.push({
        y: -3.2 + Math.random() * 6.0,         // الموقع العمودي من +2.8 (الأعلى) إلى -3.2 (مخرج العملات)
        angle: Math.random() * Math.PI * 2,    // زاوية الدوران الحلزوني
        speedFactor: 0.75 + Math.random() * 0.5,
        radialJitter: 0.78 + Math.random() * 0.22,
        passScore: Math.random()               // يحدد ما إذا كان الجسيم سيعبر مراحل القمع أم يتسرب
      });
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

    this.pMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    this.vortexPoints = new THREE.Points(pGeo, this.pMat);
    this.fScene.add(this.vortexPoints);

    // التحكم بدوران القمع بالماوس داخل لوحة القمع
    let fDrag = false;
    let fPrevX = 0;
    wrap.addEventListener('pointerdown', (e) => {
      fDrag = true;
      fPrevX = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (!fDrag) return;
      const dx = e.clientX - fPrevX;
      this.funnelGroup.rotation.y += dx * 0.01;
      fPrevX = e.clientX;
    });
    window.addEventListener('pointerup', () => {
      fDrag = false;
    });

    window.addEventListener('resize', () => {
      if (!wrap.clientWidth) return;
      this.fCamera.aspect = wrap.clientWidth / wrap.clientHeight;
      this.fCamera.updateProjectionMatrix();
      this.fRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    });

    const animateFunnel = () => {
      requestAnimationFrame(animateFunnel);
      this.updateVortexParticles();
      this.funnelGroup.rotation.y += 0.0035;
      this.fRenderer.render(this.fScene, this.fCamera);
    };
    animateFunnel();
  }

  // حساب نصف قطر القمع عند أي ارتفاع عمودي (y) بالاستيفاء السلس بين المستويات الأربعة
  getFunnelRadiusAtY(y) {
    const { rAwareness, rInterest, rDesire, rAction } = this.funnelParams;
    if (y >= 1.0) {
      // بين مستوى الوعي (+2.8) ومستوى الاهتمام (+1.0)
      const t = Math.min(1, Math.max(0, (y - 1.0) / 1.8));
      return rInterest + t * (rAwareness - rInterest);
    } else if (y >= -0.6) {
      // بين مستوى الاهتمام (+1.0) ومستوى الرغبة (-0.6)
      const t = Math.min(1, Math.max(0, (y - (-0.6)) / 1.6));
      return rDesire + t * (rInterest - rDesire);
    } else if (y >= -2.1) {
      // بين مستوى الرغبة (-0.6) ومخرج الإجراء (-2.1)
      const t = Math.min(1, Math.max(0, (y - (-2.1)) / 1.5));
      return rAction + t * (rDesire - rAction);
    } else {
      // منطقة تدفق العملات الذهبية أسفل القمع (-2.1 إلى -3.3)
      const spread = 1 + ((-2.1 - y) * 0.35);
      return rAction * 0.7 * spread;
    }
  }

  buildFunnelMesh() {
    while (this.funnelGroup.children.length > 0) {
      const child = this.funnelGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      this.funnelGroup.remove(child);
    }

    // 1. بناء المجسم الشبكي للقمع
    const lathePoints = [];
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const y = -2.1 + (i / steps) * 4.9; // من -2.1 إلى +2.8
      const r = this.getFunnelRadiusAtY(y);
      lathePoints.push(new THREE.Vector2(r, y));
    }

    const latheGeo = new THREE.LatheGeometry(lathePoints, 32);
    const latheMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    this.funnelWireframe = new THREE.Mesh(latheGeo, latheMat);
    this.funnelGroup.add(this.funnelWireframe);

    // 2. إضافة 4 حلقات مضيئة تمثل مستويات AIDA الأربعة وتتغير أقطارها مع المدخلات
    const levels = [
      { y: 2.8, r: this.funnelParams.rAwareness, color: 0x22d3ee }, // Awareness
      { y: 1.0, r: this.funnelParams.rInterest, color: 0x818cf8 },  // Interest
      { y: -0.6, r: this.funnelParams.rDesire, color: 0xe879f9 },   // Desire
      { y: -2.1, r: this.funnelParams.rAction, color: 0xfbbf24 }    // Action
    ];

    levels.forEach(lvl => {
      const ringGeo = new THREE.RingGeometry(Math.max(0.1, lvl.r - 0.06), lvl.r + 0.06, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: lvl.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = lvl.y;
      this.funnelGroup.add(ringMesh);
    });
  }

  // تحديث هندسة القمع وسرعة الجسيمات وكثافتها فور تغيير أي مدخل من قبل المستخدم
  updateFunnelGeometry(traffic, interestRate, desireRate, actionRate, revPerOrder = 250000) {
    if (!this.fScene) return;

    // تناسب أقطار القمع الأربعة مباشرة مع قيم أشرطة التمرير
    this.funnelParams.rAwareness = 1.8 + (traffic / 50000) * 2.1;
    this.funnelParams.rInterest = 0.9 + (interestRate / 90) * (this.funnelParams.rAwareness * 0.78);
    this.funnelParams.rDesire = 0.45 + (desireRate / 80) * (this.funnelParams.rInterest * 0.75);
    this.funnelParams.rAction = 0.22 + (actionRate / 60) * (this.funnelParams.rDesire * 0.72);

    // تحديث سرعة الهبوط العمودي والدوران الحلزوني وكثافة الجسيمات
    this.funnelParams.dropSpeed = 0.026 + (actionRate / 100) * 0.045;
    this.funnelParams.vortexSpin = 0.032 + (interestRate / 100) * 0.05;
    this.funnelParams.activeRatio = 0.25 + (traffic / 50000) * 0.75;
    this.funnelParams.conversionRatio = Math.max(0.08, (interestRate / 100) * (desireRate / 100) * (actionRate / 100) * 3.5);
    this.funnelParams.coinScale = 0.19 + (revPerOrder / 2000000) * 0.14;

    if (this.pMat) {
      this.pMat.size = this.funnelParams.coinScale;
    }

    this.buildFunnelMesh();
  }

  updateVortexParticles() {
    if (!this.vortexPoints) return;
    const positions = this.vortexPoints.geometry.attributes.position.array;
    const colors = this.vortexPoints.geometry.attributes.color.array;

    const activeCount = Math.floor(this.maxVortexParticles * this.funnelParams.activeRatio);
    this.vortexPoints.geometry.setDrawRange(0, activeCount);

    for (let i = 0; i < activeCount; i++) {
      const p = this.vortexData[i];

      // 1. الحركة العمودية المستمرة نحو أسفل القمع (تزداد سرعتها كلما ضاق القمع)
      const currentRadius = this.getFunnelRadiusAtY(p.y);
      const funnelAcceleration = 1.0 + (1.2 / Math.max(0.35, currentRadius)) * 0.45;
      p.y -= this.funnelParams.dropSpeed * p.speedFactor * funnelAcceleration;

      // محاكاة تسرب المستخدمين غير المتحولين قبل الوصول لمخرج العملات الذهبية
      if (p.y < -0.6 && p.passScore > (0.35 + this.funnelParams.conversionRatio)) {
        p.y = 2.8; // إعادة تدوير الجسيم إلى أعلى القمع
      }

      // إعادة الجسيم إلى فوهة القمع العليا بعد خروجه من الأسفل كعملة ذهبية
      if (p.y < -3.3) {
        p.y = 2.8;
        p.angle = Math.random() * Math.PI * 2;
      }

      // 2. الدوران الحلزوني حول محور القمع أثناء النزول للأسفل
      const angularVelocity = this.funnelParams.vortexSpin * (2.4 / Math.max(0.3, currentRadius));
      p.angle += angularVelocity * p.speedFactor;

      const r = this.getFunnelRadiusAtY(p.y) * p.radialJitter;
      const idx = i * 3;
      positions[idx] = Math.cos(p.angle) * r;
      positions[idx + 1] = p.y;
      positions[idx + 2] = Math.sin(p.angle) * r;

      // 3. التدرج اللوني حسب مرحلة القمع (AIDA)
      if (p.y >= 1.0) {
        // الوعي (Awareness) - سماوي
        colors[idx] = 0.13; colors[idx + 1] = 0.83; colors[idx + 2] = 0.93;
      } else if (p.y >= -0.6) {
        // الاهتمام (Interest) - نيلي
        colors[idx] = 0.50; colors[idx + 1] = 0.55; colors[idx + 2] = 0.97;
      } else if (p.y >= -2.1) {
        // الرغبة (Desire) - أرجواني
        colors[idx] = 0.91; colors[idx + 1] = 0.47; colors[idx + 2] = 0.98;
      } else {
        // الإجراء وتدفق العائد المالي (Action / Revenue Coins) - ذهبي ساطع
        colors[idx] = 0.98; colors[idx + 1] = 0.78; colors[idx + 2] = 0.12;
      }
    }

    this.vortexPoints.geometry.attributes.position.needsUpdate = true;
    this.vortexPoints.geometry.attributes.color.needsUpdate = true;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.portalThree = new PortalThreeScenes();
});