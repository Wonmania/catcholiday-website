const header = document.querySelector('.nav-wrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.step-card, .proof-copy, .chart-card, .deal, .cta-card').forEach((el) => observer.observe(el));
}

if (new URLSearchParams(location.search).get('katilim') === 'basarili') {
  document.querySelector('.toast').classList.add('show');
  history.replaceState({}, '', `${location.pathname}#erken-erisim`);
}
