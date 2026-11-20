import { Dialog, Drawer } from 'https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js';

(() => {
  'use strict';

  const CART_STORAGE_KEY = 'Eternitee-cart-v1';
  const navDrawerElement = document.getElementById('shopNav');

  window.sendEmail = function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    const recipient = "hello@examplewebsite142.com";
    const subject = encodeURIComponent(`Eternitee Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const closeNav = document.getElementById('closeNav');

    if (!navDrawerElement) return;

    const drawer = Drawer.getOrCreateInstance(navDrawerElement);

    if (navToggle) {
      navToggle.addEventListener('click', function () {
        drawer.show();
        navToggle.setAttribute('aria-expanded', 'true');
      });
    }

    if (closeNav) closeNav.addEventListener('click', function () { drawer.hide(); });

    function resetExpandedState() {
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }

    navDrawerElement.addEventListener('close', resetExpandedState);
    navDrawerElement.addEventListener('hidden.bs.drawer', resetExpandedState);

    navDrawerElement.addEventListener('click', function (event) {
      if (event.target.closest('a')) drawer.hide();
    });
  }

  function updateCartBadge() {
    const bagCount = document.getElementById('bagCount');
    if (!bagCount) return;
    try {
      const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      let total = 0;
      for (const item of savedCart) total += (item.quantity || 1);
      bagCount.textContent = total;
    } catch (e) {
      bagCount.textContent = '0';
    }
  }

  initializeNavigation();
  updateCartBadge();
})();