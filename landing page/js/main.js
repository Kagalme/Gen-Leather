/* ============================================================
   KALIA CRAFT — main.js
   ============================================================ */

/* ---- Intersection Observer: Fade-up animations ---- */
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach(el => observer.observe(el));

/* ---- Nav scroll effect ---- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.boxShadow = '0 2px 20px rgba(58,44,30,0.1)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

/* ---- Mobile burger menu ---- */
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

function closeMobile() {
  mobileMenu.classList.remove('open');
}

/* ---- Ulasan (Testimonial) Carousel ---- */
const track     = document.getElementById('ulasanTrack');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const cards     = track ? track.querySelectorAll('.ulasan__card') : [];
let currentIdx  = 0;
let cardWidth   = 0;
let visibleCount = 2;

function getCardWidth() {
  if (!cards.length) return 0;
  const vw = window.innerWidth;
  visibleCount = vw <= 768 ? 1 : 2;
  const gap = 32; // 2rem
  const trackWidth = track.parentElement.offsetWidth;
  return (trackWidth - gap * (visibleCount - 1)) / visibleCount;
}

function slideCarousel() {
  cardWidth = getCardWidth();
  const offset = currentIdx * (cardWidth + 32);
  track.style.transform = `translateX(-${offset}px)`;
  // Fix card widths dynamically
  cards.forEach(c => {
    c.style.minWidth = cardWidth + 'px';
  });
}

function updateButtons() {
  const maxIdx = Math.max(0, cards.length - visibleCount);
  prevBtn.style.opacity = currentIdx === 0 ? '0.3' : '1';
  nextBtn.style.opacity = currentIdx >= maxIdx ? '0.3' : '1';
}

nextBtn && nextBtn.addEventListener('click', () => {
  const maxIdx = Math.max(0, cards.length - visibleCount);
  if (currentIdx < maxIdx) {
    currentIdx++;
    slideCarousel();
    updateButtons();
  }
});

prevBtn && prevBtn.addEventListener('click', () => {
  if (currentIdx > 0) {
    currentIdx--;
    slideCarousel();
    updateButtons();
  }
});

window.addEventListener('resize', () => {
  currentIdx = 0;
  slideCarousel();
  updateButtons();
});

// Init carousel
window.addEventListener('load', () => {
  slideCarousel();
  updateButtons();
});

/* ---- Smooth parallax on hero image ---- */
const heroImg = document.querySelector('.hero__img-wrap img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroImg.style.transform = `scale(1.04) translateY(${scrollY * 0.06}px)`;
    }
  });
}

/* ---- Smooth scroll for all anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- Active nav link highlight on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--gold)' : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);
sections.forEach(s => sectionObserver.observe(s));