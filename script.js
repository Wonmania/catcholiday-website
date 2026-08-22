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

const legalCompanyName = '90 Plus Internet Hızmetleri Ticaret Limited Şirketi';
if (document.body.classList.contains('subpage')) {
  const ownerCard = document.createElement('div');
  ownerCard.className = 'legal-owner';
  ownerCard.innerHTML = `<small>RESMÎ ŞİRKET UNVANI</small><strong>${legalCompanyName}</strong>`;
  const policyAnchor = document.querySelector('.policy-card .updated');
  const contactAnchor = document.querySelector('.contact-info h2');
  const aboutAnchor = document.querySelector('.company-grid');
  if (policyAnchor) policyAnchor.insertAdjacentElement('afterend', ownerCard);
  else if (contactAnchor) contactAnchor.insertAdjacentElement('afterend', ownerCard);
  else if (aboutAnchor) aboutAnchor.insertAdjacentElement('afterend', ownerCard);
}
