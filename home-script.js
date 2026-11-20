/* Eternitee homepage interactions — vanilla JavaScript, no plugin required. */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('productSearch');
  const productCards = Array.from(document.querySelectorAll('.product-card'));
  const productGrid = document.querySelector('.home-shop');

  // Product search: filters the three existing products as the visitor types.
  if (searchInput && productCards.length) {
    const noResults = document.createElement('p');
    noResults.className = 'search-no-results';
    noResults.setAttribute('role', 'status');
    noResults.setAttribute('aria-live', 'polite');
    noResults.textContent = 'No products found. Try another search.';
    noResults.hidden = true;
    if (productGrid) productGrid.insertAdjacentElement('afterend', noResults);

    const filterProducts = () => {
      const query = searchInput.value.trim().toLocaleLowerCase();
      let visibleCount = 0;

      productCards.forEach((card) => {
        const searchableText = card.textContent.toLocaleLowerCase();
        const matches = searchableText.includes(query);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      noResults.hidden = visibleCount !== 0;
      if (productGrid) productGrid.setAttribute('aria-label', `${visibleCount} product${visibleCount === 1 ? '' : 's'} shown`);
    };

    searchInput.addEventListener('input', filterProducts);
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        filterProducts();
        searchInput.blur();
      }
    });
  }

  // Smoothly scroll to homepage sections when an in-page navigation link is used.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', targetId);
      }
    });
  });

  // Keep the current homepage section visually identified in the navigation.
  const navLinks = Array.from(document.querySelectorAll('.navbar-selections a[href^="#"]'));
  const sections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((item) => item.section);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sections.forEach(({ link, section }) => {
          if (section === entry.target) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach(({ section }) => observer.observe(section));
  }
});
