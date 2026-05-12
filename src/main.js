import './styles/global.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

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

// 2. Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
  const posX = e.clientX;
  const posY = e.clientY;

  // Dot follows instantly
  cursorDot.style.left = `${posX}px`;
  cursorDot.style.top = `${posY}px`;

  // Outline follows with slight delay
  cursorOutline.animate({
    left: `${posX}px`,
    top: `${posY}px`
  }, { duration: 500, fill: "forwards" });
});

// Magnetic Buttons
const magneticButtons = document.querySelectorAll('.magnetic-btn');

magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const position = btn.getBoundingClientRect();
    const x = e.pageX - position.left - position.width / 2;
    const y = e.pageY - position.top - position.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 1,
      ease: 'power3.out',
    });
    
    // Expand cursor
    cursorOutline.style.width = '60px';
    cursorOutline.style.height = '60px';
    cursorOutline.style.backgroundColor = 'rgba(203, 168, 106, 0.1)';
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
    });
    
    // Reset cursor
    cursorOutline.style.width = '40px';
    cursorOutline.style.height = '40px';
    cursorOutline.style.backgroundColor = 'transparent';
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
    gsap.to(project.querySelector('.mockup-img'), {
      y: '-10%',
      ease: 'none',
      scrollTrigger: {
        trigger: project,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
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
      link: 'https://aetheronai.online/'
    },
    'aetherbuilt-os': {
      title: 'AetherBuilt OS',
      tag: 'SaaS • Motion • Product Design',
      overview: 'A sleek operating-system inspired landing page for a factory intelligence platform.',
      issues: 'The goal was to present complex SaaS data in an engaging way.',
      solutions: 'We built an OS-inspired layout utilizing modular UI systems, mimicking a real terminal and desktop environment. Terminal-style transitions and depth blur effects simulate interacting with physical software.',
      delivery: 'Achieved strong SaaS positioning with an interactive product presentation, cementing a modern enterprise aesthetic that drives demo bookings.',
      link: 'https://aether-built-landing-page.vercel.app/'
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
});
