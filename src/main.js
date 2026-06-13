import './styles/global.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// Web Audio API Sound Synthesizer
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  try {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    if (type === 'hover') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'modal') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.linearRampToValueAtTime(440, now + 0.4);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(223, now);
      osc2.frequency.linearRampToValueAtTime(446, now + 0.4);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    }
  } catch (e) {
    console.warn('Web Audio API not supported:', e);
  }
}

// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// 2. Custom Cursor (GSAP hardware accelerated)
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const cursorText = document.querySelector('.cursor-text');

if (cursorDot && cursorOutline) {
  gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
  gsap.set(cursorOutline, { xPercent: -50, yPercent: -50 });

  const xToDot = gsap.quickTo(cursorDot, "x", { duration: 0.1, ease: "power3.out" });
  const yToDot = gsap.quickTo(cursorDot, "y", { duration: 0.1, ease: "power3.out" });
  
  const xToOutline = gsap.quickTo(cursorOutline, "x", { duration: 0.35, ease: "power3.out" });
  const yToOutline = gsap.quickTo(cursorOutline, "y", { duration: 0.35, ease: "power3.out" });

  window.addEventListener('mousemove', (e) => {
    xToDot(e.clientX);
    yToDot(e.clientY);
    xToOutline(e.clientX);
    yToOutline(e.clientY);
  });

  // Magnetic & Hover animations for all links and buttons
  const hoverables = document.querySelectorAll('a, button, .est-opt, .est-timeline, .faq-question');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      playSound('hover');
      gsap.to(cursorOutline, {
        scale: 1.3,
        borderColor: 'var(--color-accent-gold)',
        backgroundColor: 'rgba(203, 168, 106, 0.08)',
        duration: 0.2
      });
      gsap.to(cursorDot, {
        scale: 0.5,
        duration: 0.2
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursorOutline, {
        scale: 1,
        borderColor: 'rgba(203, 168, 106, 0.5)',
        backgroundColor: 'transparent',
        duration: 0.2
      });
      gsap.to(cursorDot, {
        scale: 1,
        duration: 0.2
      });
    });

    el.addEventListener('click', () => {
      playSound('click');
    });
  });

  // Custom Cursor VIEWS Hover for Project Mockups + Screenshot Hover Scrolling
  const mockups = document.querySelectorAll('.mockup-container');
  mockups.forEach(mockup => {
    mockup.addEventListener('mouseenter', () => {
      playSound('hover');
      const img = mockup.querySelector('.screenshot-img');
      const windowContent = mockup.querySelector('.window-content');
      if (img && windowContent) {
        const scrollAmount = img.offsetHeight - windowContent.offsetHeight;
        if (scrollAmount > 0) {
          const duration = scrollAmount / 110;
          gsap.to(img, {
            y: -scrollAmount,
            duration: duration,
            ease: 'power1.inOut',
            overwrite: 'auto'
          });
        }
      }
      gsap.to(cursorOutline, {
        scale: 2,
        backgroundColor: 'var(--color-accent-gold)',
        borderColor: 'var(--color-accent-gold)',
        duration: 0.3
      });
      gsap.to(cursorDot, {
        opacity: 0,
        duration: 0.2
      });
      if (cursorText) {
        cursorText.textContent = "VIEW";
        cursorText.style.opacity = 1;
      }
    });

    mockup.addEventListener('mouseleave', () => {
      const img = mockup.querySelector('.screenshot-img');
      if (img) {
        gsap.to(img, {
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
      gsap.to(cursorOutline, {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'rgba(203, 168, 106, 0.5)',
        duration: 0.3
      });
      gsap.to(cursorDot, {
        opacity: 1,
        duration: 0.2
      });
      if (cursorText) {
        cursorText.style.opacity = 0;
      }
    });
  });
}

// Magnetic Buttons (Optimized)
const magneticButtons = document.querySelectorAll('.magnetic-btn');
magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const position = btn.getBoundingClientRect();
    const x = e.clientX - position.left - position.width / 2;
    const y = e.clientY - position.top - position.height / 2;

    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.6,
      ease: 'power2.out',
    });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
    });
  });
});

// 3. Animations Setup
document.addEventListener('DOMContentLoaded', () => {
  // Hero Animation
  const heroTl = gsap.timeline();
  
  heroTl.to('.hero-content', {
    y: 0,
    opacity: 1,
    duration: 1.5,
    ease: 'power4.out',
    delay: 0.2
  })
  .fromTo('.hero-ambient-glow', 
    { scale: 0.8, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' },
    '-=1'
  );

  // Parallax Hero Grid
  gsap.to('.hero-grid', {
    y: '20%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Services Cards Animation
  gsap.from('.service-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%',
    }
  });

  // Projects Animation
  const projects = document.querySelectorAll('.project-item');
  projects.forEach((project) => {
    gsap.from(project.querySelector('.project-info'), {
      x: project.classList.contains('reverse') ? 50 : -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: project,
        start: 'top 75%',
      }
    });

    gsap.from(project.querySelector('.project-visual'), {
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: project,
        start: 'top 75%',
      }
    });
    
    // Image Parallax within mockup
    const mockupImg = project.querySelector('.mockup-img');
    if (mockupImg) {
      gsap.to(mockupImg, {
        y: '-10%',
        ease: 'none',
        scrollTrigger: {
          trigger: project,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  });

  // Process Timeline Scroll Animation
  const processPinWrap = document.querySelector('.process-pin-wrap');
  const processScrollWrap = document.querySelector('.process-scroll-wrap');
  
  if (processPinWrap && processScrollWrap) {
    let mm = gsap.matchMedia();

    // Desktop: Horizontal Scroll
    mm.add("(min-width: 768px)", () => {
      let scrollWidth = processScrollWrap.scrollWidth - window.innerWidth + 100;
      
      gsap.to(processScrollWrap, {
        x: () => -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: processPinWrap,
          pin: true,
          scrub: 1,
          start: "center center",
          end: () => "+=" + scrollWidth,
          invalidateOnRefresh: true
        }
      });

      gsap.from('.process-step-horizontal', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: processPinWrap,
          start: "top 70%",
        }
      });
    });

    // Mobile: Vertical Stack (No pinning, just fade up)
    mm.add("(max-width: 767px)", () => {
      gsap.from('.process-step-horizontal', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: processPinWrap,
          start: "top 80%",
        }
      });
    });
  }

  // Numbers counter animation
  const counters = document.querySelectorAll('.stat-num.counter');
  counters.forEach((counter) => {
    const text = counter.innerText;
    if (text.includes('+') || text.includes('%')) {
      const num = parseInt(text);
      if(!isNaN(num)) {
        const symbol = text.replace(/[0-9]/g, '');
        gsap.fromTo(counter, 
          { innerHTML: 0 },
          {
            innerHTML: num,
            duration: 2,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            onUpdate: function() {
              counter.innerHTML = Math.round(this.targets()[0].innerHTML) + symbol;
            },
            scrollTrigger: {
              trigger: '.why-us-stats',
              start: 'top 85%',
            }
          }
        );
      }
    }
  });

  // Pricing Cards
  gsap.from('.pricing-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pricing-grid',
      start: 'top 80%',
    }
  });

  // CTA Animation
  gsap.from('.cta-title', {
    scale: 0.9,
    opacity: 0,
    duration: 1.5,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.cta',
      start: 'top 70%',
    }
  });

  // Case Study Modal Logic
  const caseStudiesData = {
    'aetheron-ai': {
      title: 'Aetheron AI',
      tag: 'AI • Startup • Motion',
      overview: 'A futuristic AI company website designed to communicate modular intelligence, automation systems and next-generation technology.',
      issues: 'Needed a digital presence that matched their cutting-edge technology. The existing brand didn\'t communicate the sophisticated, modular nature of their AI solutions.',
      solutions: 'We went with a "Futuristic Dark Mode" aesthetic. Leveraging moving grid backgrounds, animated AI particles, and glowing transitions to bring their product to life.',
      delivery: 'Elevated visual identity, stronger startup positioning, and a premium digital presence that immediately commands authority in the AI space.',
      link: 'https://aetheronai.in'
    },
    'sony-three': {
      title: 'Sony WH-1000XM6',
      tag: '3D • WebGL • Sound Design • Immersive',
      overview: 'A premium 3D exploding showcase designed for Sony\'s flagship headphones, incorporating WebGL particle explosions, custom audio cues, and modular specifications storytelling.',
      issues: 'Needed a highly interactive, cinematic web experience to capture customer imagination and demonstrate internal hardware configurations during pre-order phase.',
      solutions: 'We engineered a WebGL product stage with responsive orbit controls, smooth scroll animations, and exploding mechanical components triggered by GSAP timeline controls.',
      delivery: 'An award-winning experiential showcase page displaying premium hardware, generating high conversion rates and immersive visual storytelling.',
      link: 'https://sony-three.vercel.app/'
    },
    'aetherbuilt-os': {
      title: 'AetherBuilt OS',
      tag: 'SaaS • Motion • Product Design',
      overview: 'A sleek operating-system inspired landing page for a factory intelligence platform.',
      issues: 'The goal was to present complex SaaS data in an engaging way.',
      solutions: 'We built an OS-inspired layout utilizing modular UI systems, mimicking a real terminal and desktop environment. Terminal-style transitions and depth blur effects simulate interacting with physical software.',
      delivery: 'Achieved strong SaaS positioning with an interactive product presentation, cementing a modern enterprise aesthetic that drives demo bookings.',
      link: 'https://aether-built-website.vercel.app/'
    },
    'ram-industries': {
      title: 'Ram Industries',
      tag: 'Corporate • Industry • Branding',
      overview: 'A modern industrial website redesign created to transform a traditional manufacturing business into a premium digital brand.',
      issues: 'Traditional manufacturing websites often feel outdated.',
      solutions: 'We injected a trust-driven design language focusing on subtle metallic lighting and industrial texture overlays. Animated line systems subtly mimic pipelines and industrial processes.',
      delivery: 'Delivered a cleaner digital identity, vastly improved visual trust, and established a commanding online presence that outshines legacy competitors.',
      link: 'https://ram-industries-showcase-bo72iu0uq.vercel.app/'
    },
    'tcet-edic': {
      title: 'TCET EDIC',
      tag: 'Education • Startup Ecosystem • Innovation',
      overview: 'An entrepreneurship and innovation platform built to centralize startup activities, mentorship systems and student innovation initiatives.',
      issues: 'Needed to build a community-centered platform that connects students with mentorship and resources.',
      solutions: 'We focused on educational UI patterns with a modern, startup-like twist. Animated node systems and glowing connection lines visually represent networking and ecosystem growth.',
      delivery: 'Significantly improved student engagement, streamlined the flow of information across the campus, and built a stronger, more visible startup ecosystem.',
      link: 'https://edic-new.vercel.app/'
    }
  };

  const modalOverlay = document.getElementById('case-study-modal');
  const modalClose = document.getElementById('modal-close');
  
  if (modalOverlay && modalClose) {
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalOverview = document.getElementById('modal-overview');
    const modalIssues = document.getElementById('modal-issues');
    const modalSolutions = document.getElementById('modal-solutions');
    const modalDelivery = document.getElementById('modal-delivery');
    const modalLink = document.getElementById('modal-link');

    const openModal = (projectId) => {
      playSound('modal');
      const data = caseStudiesData[projectId];
      if (data) {
        modalTag.textContent = data.tag;
        modalTitle.textContent = data.title;
        modalOverview.textContent = data.overview;
        modalIssues.textContent = data.issues;
        modalSolutions.textContent = data.solutions;
        modalDelivery.textContent = data.delivery;
        modalLink.href = data.link;

        modalOverlay.classList.remove('hidden');
        lenis.stop(); // Pause smooth scrolling while modal is open
      }
    };

    const closeModal = () => {
      playSound('click');
      modalOverlay.classList.add('hidden');
      lenis.start(); // Resume smooth scrolling
    };

    document.querySelectorAll('.case-study-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectId = btn.getAttribute('data-project');
        openModal(projectId);
      });
    });

    modalClose.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // A. Mobile Navigation Drawer Toggle
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksList = document.querySelectorAll('.nav-links a');
  
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      playSound('click');
      nav.classList.toggle('nav-open');
      if (nav.classList.contains('nav-open')) {
        lenis.stop(); // Pause smooth scrolling while menu is open
      } else {
        lenis.start(); // Resume
      }
    });
    
    // Close drawer on click of links
    navLinksList.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        lenis.start();
      });
    });
  }

  // B. Spotlight Card Hover Effect
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // C. Project Cost Estimator Logic
  const pageSlider = document.getElementById('page-count');
  const pageVal = document.getElementById('page-count-val');
  const sumBase = document.getElementById('sum-base');
  const sumPages = document.getElementById('sum-pages');
  const sumFeatures = document.getElementById('sum-features');
  const sumTimeline = document.getElementById('sum-timeline');
  const sumTotal = document.getElementById('sum-total');
  const bookCalcBtn = document.getElementById('book-calc-btn');
  
  if (pageSlider) {
    let currentType = 'landing';
    let currentTimeline = 'standard';
    
    const typeButtons = document.querySelectorAll('.est-opt');
    const timelineButtons = document.querySelectorAll('.est-timeline');
    
    const featCms = document.getElementById('feat-cms');
    const featAi = document.getElementById('feat-ai');
    const featAnimations = document.getElementById('feat-animations');
    
    const prices = {
      landing: { base: 1999, pageRate: 499 },
      animated: { base: 6999, pageRate: 999 },
      immersive: { base: 14999, pageRate: 1499 }
    };
    
    const calculateTotal = () => {
      const basePrice = prices[currentType].base;
      const pageCount = parseInt(pageSlider.value);
      
      // Update pages display
      pageVal.textContent = pageCount === 1 ? "1 Page" : `${pageCount} Pages`;
      
      // Compute page cost (first page included in base)
      const pagesCost = (pageCount - 1) * prices[currentType].pageRate;
      
      // Compute features
      let featuresCost = 0;
      if (featCms && featCms.checked) featuresCost += 1999;
      if (featAi && featAi.checked) featuresCost += 2999;
      if (currentType === 'landing' && featAnimations && featAnimations.checked) {
        featuresCost += 999;
      }
      
      const subtotal = basePrice + pagesCost + featuresCost;
      
      // Compute urgency multiplier (+15% on subtotal)
      let timelineCost = 0;
      if (currentTimeline === 'fast') {
        timelineCost = Math.round(subtotal * 0.15);
      }
      
      const total = subtotal + timelineCost;
      
      // Format to INR Currency
      const formatINR = (num) => "₹" + num.toLocaleString('en-IN');
      
      if (sumBase) sumBase.textContent = formatINR(basePrice);
      if (sumPages) sumPages.textContent = formatINR(pagesCost);
      if (sumFeatures) sumFeatures.textContent = formatINR(featuresCost);
      if (sumTimeline) sumTimeline.textContent = formatINR(timelineCost);
      if (sumTotal) sumTotal.textContent = formatINR(total);
      
      // Prefilled WhatsApp message
      const textMsg = `Hi K-Studios! I used the Project Estimator on your website and would like to hire you.
Scope details:
- Project Type: ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}
- Pages: ${pageCount}
- Features: ${[
        (currentType !== 'landing' || (featAnimations && featAnimations.checked)) ? "Custom GSAP Animations" : "",
        (featCms && featCms.checked) ? "CMS / Admin Panel" : "",
        (featAi && featAi.checked) ? "AI Chatbot" : "",
        "SEO Audit"
      ].filter(Boolean).join(', ')}
- Timeline: ${currentTimeline === 'fast' ? "Fast Track (2 weeks)" : "Standard (4-6 weeks)"}
- Estimated Price: ${formatINR(total)}`;
      
      if (bookCalcBtn) {
        bookCalcBtn.href = `https://wa.me/918928352406?text=${encodeURIComponent(textMsg)}`;
      }
    };
    
    typeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.getAttribute('data-type');
        
        if (featAnimations) {
          if (currentType === 'landing') {
            featAnimations.disabled = false;
            featAnimations.checked = false;
          } else {
            featAnimations.disabled = true;
            featAnimations.checked = true;
          }
        }
        calculateTotal();
      });
    });
    
    timelineButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        timelineButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTimeline = btn.getAttribute('data-time');
        calculateTotal();
      });
    });
    
    pageSlider.addEventListener('input', calculateTotal);
    if (featCms) featCms.addEventListener('change', calculateTotal);
    if (featAi) featAi.addEventListener('change', calculateTotal);
    if (featAnimations) featAnimations.addEventListener('change', calculateTotal);
    
    calculateTotal();
  }

  // D. FAQ Accordion Toggle Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = item.classList.contains('active');
        
        // Collapse other active accordion items
        faqItems.forEach(el => {
          el.classList.remove('active');
          const ans = el.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
        });
        
        if (!isActive) {
          playSound('click');
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          playSound('click');
        }
      });
    }
  });
});
