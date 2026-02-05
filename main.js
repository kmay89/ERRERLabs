// Performance-optimized scroll handling
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scroll-progress');
const revealElements = document.querySelectorAll('.reveal');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

let ticking = false;
let lastScrollY = 0;
let cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
let resizeTimeout;

function updateScroll() {
  const scrollY = lastScrollY;

  // Nav scroll state
  if (scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  // Progress bar - GPU accelerated with scaleX transform
  const scrollPercent = cachedScrollHeight > 0 ? scrollY / cachedScrollHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(scrollPercent, 1)})`;

  // Reveal elements
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      el.classList.add('visible');
    }
  });

  ticking = false;
}

// Passive scroll listener for buttery performance
window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(updateScroll);
    ticking = true;
  }
}, { passive: true });

// Recalculate scroll height on resize (debounced)
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  }, 150);
}, { passive: true });

// Initial call on load
window.addEventListener('load', updateScroll);

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
  const isActive = hamburger.classList.toggle('active');
  mobileNav.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');

  // Prevent body scroll when menu is open
  document.body.style.overflow = isActive ? 'hidden' : '';
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Smooth scroll for anchor links (both desktop and mobile)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
