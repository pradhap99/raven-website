// ============================================
// RAVEN — World-Class Animations & Interactions
// ============================================

import * as THREE from 'three';

// ============ THREE.JS NEURAL NETWORK BACKGROUND ============
(function initNeuralBackground() {
  const canvas = document.getElementById('neural-bg');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  const spread = 40;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities.push({
      x: (Math.random() - 0.5) * 0.005,
      y: (Math.random() - 0.5) * 0.005,
      z: (Math.random() - 0.5) * 0.005
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Lines between nearby particles
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(particleCount * particleCount * 6);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  camera.position.z = 20;

  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    const pos = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3]     += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;

      // Boundary wrap
      for (let j = 0; j < 3; j++) {
        if (pos[i * 3 + j] > spread / 2) pos[i * 3 + j] = -spread / 2;
        if (pos[i * 3 + j] < -spread / 2) pos[i * 3 + j] = spread / 2;
      }
    }
    geometry.attributes.position.needsUpdate = true;

    // Update line connections
    let lineIdx = 0;
    const maxDist = 6;
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist && lineIdx < linePositions.length - 6) {
          linePositions[lineIdx++] = pos[i * 3];
          linePositions[lineIdx++] = pos[i * 3 + 1];
          linePositions[lineIdx++] = pos[i * 3 + 2];
          linePositions[lineIdx++] = pos[j * 3];
          linePositions[lineIdx++] = pos[j * 3 + 1];
          linePositions[lineIdx++] = pos[j * 3 + 2];
        }
      }
    }
    // Clear remaining
    for (let i = lineIdx; i < linePositions.length; i++) {
      linePositions[i] = 0;
    }
    lineGeometry.attributes.position.needsUpdate = true;

    // Camera follow mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    // Subtle rotation
    points.rotation.y += 0.0003;
    points.rotation.x += 0.0001;
    lines.rotation.y += 0.0003;
    lines.rotation.x += 0.0001;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ============ CUSTOM CURSOR ============
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  let mx = 0, my = 0;
  let cx = 0, cy = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Magnetic effect for [data-magnetic] elements
  const magneticEls = document.querySelectorAll('[data-magnetic]');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.3;
      const deltaY = (e.clientY - centerY) * 0.3;
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // Hover detection
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [role="button"], [data-magnetic], .demo-prompt, .poly-card')) {
      cursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [role="button"], [data-magnetic], .demo-prompt, .poly-card')) {
      cursor.classList.remove('hovering');
    }
  });

  function animateCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    rx += (mx - rx) * 0.08;
    ry += (my - ry) * 0.08;

    dot.style.transform = `translate(${cx - 3}px, ${cy - 3}px)`;
    ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
})();


// ============ GSAP ANIMATIONS ============
gsap.registerPlugin(ScrollTrigger);

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Hero entrance animations
window.addEventListener('DOMContentLoaded', () => {
  // Initialize Splitting.js
  Splitting();
  lucide.createIcons();

  const tl = gsap.timeline({ delay: 0.3 });

  // Badge
  tl.to('.hero-badge', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Title characters - staggered reveal
  tl.to('.hero-title .char', {
    opacity: 1,
    y: 0,
    rotateX: 0,
    stagger: 0.02,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.4');

  // Subtitle
  tl.to('.hero-sub', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.4');

  // CTA
  tl.to('.hero-cta-group', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.4');

  // Stats
  tl.to('.hero-stats', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.3');

  // Scroll indicator
  tl.to('.hero-scroll-indicator', {
    opacity: 0.5,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.2');

  // Animate stat numbers
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const isDecimal = target % 1 !== 0;
    gsap.to({ val: 0 }, {
      val: target,
      duration: 2,
      delay: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        el.textContent = isDecimal ? this.targets()[0].val.toFixed(1) : Math.round(this.targets()[0].val);
      }
    });
  });
});


// ============ FEATURE CARD GLOW FOLLOW ============
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});


// ============ CHART LINE DRAWING ANIMATION ============
ScrollTrigger.create({
  trigger: '.features',
  start: 'top 60%',
  onEnter: () => {
    gsap.to('.chart-line', {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.out'
    });
    gsap.to('.chart-area', {
      opacity: 1,
      duration: 1.5,
      delay: 0.5,
      ease: 'power2.out'
    });
  },
  once: true
});


// ============ FEATURE CARDS STAGGER ============
gsap.from('.feature-card', {
  scrollTrigger: {
    trigger: '.features-grid',
    start: 'top 75%',
    once: true
  },
  opacity: 0,
  y: 40,
  stagger: 0.1,
  duration: 0.8,
  ease: 'power3.out'
});


// ============ DEMO RESPONSE TYPEWRITER ============
const responses = [
  `<strong>BTC 4-Hour Price Forecast</strong><br><br>Based on current market analysis, momentum indicators, and sentiment data:<br><br>• <strong>Current Price:</strong> $67,245<br>• <strong>Predicted (4h):</strong> $67,890 (+0.96%)<br>• <strong>Confidence:</strong> 94.2%<br>• <strong>Direction:</strong> Bullish<br><br>Key drivers: Increasing institutional volume, positive funding rates, and strong support at $66,800.`,
  `<strong>ETH Sentiment Analysis</strong><br><br>Overall market sentiment for Ethereum is currently <span style="color: var(--color-success)">moderately bullish</span>.<br><br>• <strong>Social Score:</strong> 72/100 (positive)<br>• <strong>Fear & Greed:</strong> 65 (Greed)<br>• <strong>Whale Activity:</strong> Accumulation phase<br><br>Notable signals: Strong developer activity on L2s, increasing staking deposits, and positive commentary from institutional analysts.`,
  `<strong>Bitcoin Decline Analysis</strong><br><br>The recent Bitcoin correction is driven by three converging factors:<br><br>1. <strong>Macro Pressure:</strong> Fed hawkish signals dampening risk appetite<br>2. <strong>Miner Selling:</strong> Post-halving cost pressure forcing liquidations<br>3. <strong>Leverage Flush:</strong> $2.3B in long positions liquidated in 72 hours<br><br>Historical pattern suggests recovery within 2-3 weeks based on similar setups.`,
  `<strong>Bitcoin Investment Analysis</strong><br><br>Current risk-reward assessment:<br><br>• <strong>Signal:</strong> <span style="color: var(--color-warning)">Cautious Accumulate</span><br>• <strong>Time Horizon:</strong> 6-12 months favorable<br>• <strong>Key Level:</strong> DCA zone between $62K-$68K<br><br>Raven's model suggests current prices are within the accumulation zone for medium-term holders. Short-term volatility expected.`
];

const demoPrompts = document.querySelectorAll('.demo-prompt');
const responseBody = document.getElementById('demo-response-body');

function typeResponse(index) {
  responseBody.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';

  setTimeout(() => {
    responseBody.innerHTML = '';
    const content = responses[index];
    responseBody.innerHTML = content;
    responseBody.style.opacity = '0';
    gsap.to(responseBody, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  }, 800);
}

demoPrompts.forEach((prompt, i) => {
  prompt.addEventListener('click', () => {
    demoPrompts.forEach(p => p.classList.remove('active'));
    prompt.classList.add('active');
    typeResponse(i);
  });
});

// Init first response
setTimeout(() => typeResponse(0), 2000);


// ============ BENCHMARK RING ANIMATION ============
ScrollTrigger.create({
  trigger: '.benchmark',
  start: 'top 60%',
  onEnter: () => {
    // Animate ring
    const circumference = 2 * Math.PI * 88; // ~553
    const target = 98.6;
    const offset = circumference - (circumference * target / 100);

    gsap.to('.bench-ring-fill', {
      strokeDashoffset: offset,
      duration: 2,
      ease: 'power2.out'
    });

    // Animate ring number
    gsap.to({ val: 0 }, {
      val: 98.6,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function() {
        document.querySelectorAll('.bench-ring-number').forEach(el => {
          el.textContent = this.targets()[0].val.toFixed(1);
        });
      }
    });

    // Animate bars
    document.querySelectorAll('.bench-bar-fill').forEach(bar => {
      const width = bar.dataset.width;
      gsap.to(bar, {
        width: width + '%',
        duration: 1.5,
        delay: 0.3,
        ease: 'power2.out'
      });
    });

    // Animate bench values
    document.querySelectorAll('.bench-value').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isSmall = target < 1;
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.5,
        delay: 0.5,
        ease: 'power2.out',
        onUpdate: function() {
          el.textContent = isSmall ? this.targets()[0].val.toFixed(3) : this.targets()[0].val.toFixed(1);
        }
      });
    });
  },
  once: true
});


// ============ BENCHMARK CARDS STAGGER ============
gsap.from('.bench-card', {
  scrollTrigger: {
    trigger: '.benchmark-grid',
    start: 'top 75%',
    once: true
  },
  opacity: 0,
  y: 30,
  stagger: 0.08,
  duration: 0.7,
  ease: 'power3.out'
});


// ============ POLYMARKET CARDS STAGGER ============
gsap.from('.poly-card', {
  scrollTrigger: {
    trigger: '.poly-grid',
    start: 'top 75%',
    once: true
  },
  opacity: 0,
  y: 30,
  stagger: 0.12,
  duration: 0.7,
  ease: 'power3.out'
});


// ============ CTA SECTION ANIMATION ============
gsap.from('.cta-card', {
  scrollTrigger: {
    trigger: '.cta-section',
    start: 'top 70%',
    once: true
  },
  opacity: 0,
  scale: 0.95,
  duration: 1,
  ease: 'power3.out'
});


// ============ SMOOTH SCROLL FOR NAV ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ============ PARALLAX ON HERO ============
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.querySelector('.hero-content');
  if (hero && scrollY < window.innerHeight) {
    hero.style.transform = `translateY(${scrollY * 0.3}px)`;
    hero.style.opacity = 1 - scrollY / (window.innerHeight * 0.8);
  }
});


// ============ HIDE SCROLL INDICATOR ============
window.addEventListener('scroll', () => {
  const indicator = document.querySelector('.hero-scroll-indicator');
  if (indicator) {
    indicator.style.opacity = window.scrollY > 100 ? '0' : '0.5';
  }
});
