// Performance-optimized scroll handling
const nav = document.getElementById('nav');
const scrollProgress = document.getElementById('scroll-progress');
const revealElements = document.querySelectorAll('.reveal');
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

let ticking = false;
let lastScrollY = 0;
let cachedScrollHeight = 0;
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
// Also close mobile nav when resizing to desktop
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Close mobile nav if window is resized to desktop width
    if (window.innerWidth > 768) {
      closeMobileNav();
    }
  }, 150);
}, { passive: true });

// Initial call on load - calculate scroll height when page is fully loaded
window.addEventListener('load', () => {
  cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  updateScroll();
});

// Close mobile nav helper function
function closeMobileNav() {
  hamburger.classList.remove('active');
  mobileNav.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Toggle mobile nav helper function
function toggleMobileNav(e) {
  e.preventDefault();
  e.stopPropagation();

  const isActive = hamburger.classList.toggle('active');
  mobileNav.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  document.body.style.overflow = isActive ? 'hidden' : '';
}

// Hamburger menu toggle - handle both click and touch
hamburger.addEventListener('click', toggleMobileNav);
hamburger.addEventListener('touchend', function(e) {
  // Prevent double-firing on devices that trigger both touch and click
  e.preventDefault();
  toggleMobileNav(e);
}, { passive: false });

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Close mobile menu when clicking outside (on the backdrop)
mobileNav.addEventListener('click', function(e) {
  if (e.target === mobileNav) {
    closeMobileNav();
  }
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

// Typewriter text animation for hero - GPU optimized, mobile-friendly
(function initTypewriter() {
  const words = ['Architecture', 'Hardware', 'Firmware', 'Software'];
  const rotatingWord = document.getElementById('rotating-word');

  // Wait for DOM if element not found
  if (!rotatingWord) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTypewriter);
    }
    return;
  }

  let currentIndex = 0;
  let currentText = rotatingWord.textContent;
  let isRunning = true;
  let animationTimeout = null;

  const deleteSpeed = 45;   // ms per character delete
  const typeSpeed = 70;     // ms per character type
  const pauseBetween = 2800; // pause before starting to delete

  // Pause animation when tab is not visible (saves battery on mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationTimeout) clearTimeout(animationTimeout);
    } else {
      isRunning = true;
      animationTimeout = setTimeout(cycleWord, 500);
    }
  });

  function updateText(text) {
    currentText = text;
    rotatingWord.textContent = text;
  }

  function deleteChar() {
    if (!isRunning) return;
    if (currentText.length === 0) {
      currentIndex = (currentIndex + 1) % words.length;
      animationTimeout = setTimeout(typeChar, 150);
      return;
    }
    updateText(currentText.slice(0, -1));
    animationTimeout = setTimeout(deleteChar, deleteSpeed);
  }

  function typeChar() {
    if (!isRunning) return;
    const targetWord = words[currentIndex];
    if (currentText.length >= targetWord.length) {
      animationTimeout = setTimeout(cycleWord, pauseBetween);
      return;
    }
    updateText(currentText + targetWord[currentText.length]);
    animationTimeout = setTimeout(typeChar, typeSpeed);
  }

  function cycleWord() {
    if (!isRunning) return;
    animationTimeout = setTimeout(deleteChar, 0);
  }

  // Start after initial pause
  animationTimeout = setTimeout(cycleWord, pauseBetween);
})();
