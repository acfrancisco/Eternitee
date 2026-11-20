
import { Dialog, Drawer } from 'https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/js/bootstrap.bundle.min.js';

(() => {
  'use strict';

  const CART_STORAGE_KEY = 'eternetee-cart-v1';
  const SHIPPING_FEE = 0;
  const MAX_PAGE_QUANTITY = 10;
  const ORDER_EMAIL = 'orders@examplewebsite142.com';

  // Product Catalog: Add every product sold by the website in this section.
  const PRODUCTS = {
    'everyday-comfort-tee': {
      id: 'everyday-comfort-tee', name: 'Everyday Comfort Tee', price: 499,
      description: 'Wear a little encouragement. The Everyday Comfort Tee carries a simple reminder to live everyday with the comfort you deserve. Style it with your everyday favorites and take that intention wherever you go.',
      material: '100% cotton', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: {
        Burgundy: { swatch: '#720808', image: 'https://lh3.googleusercontent.com/d/10uc-lNGM4PgG70vZtugvp5d2EAWIy-wn', alt: 'Everyday Comfort Tee in Burgundy' }
      },
      gallery: {
          detail: { image: 'https://lh3.googleusercontent.com/d/15ZWDrJH0PljxEM_CyQXKFVZLimsDv5j5', alt: 'Close-up detail of the Everyday Comfort Tee', caption: 'The message' },
        fit: { image: 'https://lh3.googleusercontent.com/d/1BNMoMx8H4Esrqs3-5pjnK3mQ0039Cckq', alt: 'Fit and fabric view of the Everyday Comfort Tee', caption: '100% cotton' }
      },
      perks: ['100% cotton', 'Sizes XS–XXL'],
      fitDetails: 'Made from 100% cotton. Available in XS, S, M, L, XL, and XXL.'
      ,
      'dont-be-late-tee': {
      id: 'dont-be-late-tee', name: "Don't Be Late Tee", price: 499,
      description: "Wear a little encouragement. The Don't Be Late Tee carries a simple reminder to always be timely and punctual. Style it with your everyday favorites and take that intention wherever you go.",
      material: '100% cotton', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: {
        'Baby Blue': { swatch: '#bad4ed', image: 'https://lh3.googleusercontent.com/d/1fxZlRcxTH7PAb9tWm-AFMoLRpt-g6f30', alt: "Don't Be Late Tee in Baby Blue" },
      },
      gallery: {
          detail: { image: 'https://lh3.googleusercontent.com/d/1ZscKglaTzwnYMHmMJ-aCC-nuZVuEKwzT', alt: "Close-up detail of the Don't Be Late Tee", caption: 'The message' },
        fit: { image: 'https://lh3.googleusercontent.com/d/197ELkWo9MnIikJy_mHNRkkyTbXnTJSor', alt: "Fit and fabric view of the Don't Be Late Tee", caption: '100% cotton' }
      },
      perks: ['100% cotton', 'Sizes XS–XXL'],
      fitDetails: 'Made from 100% cotton. Available in XS, S, M, L, XL, and XXL.'
      ,
      'do-good-work-tee': {
      id: 'do-good-work-tee', name: 'Do Good Work Tee', price: 499,
      description: 'Wear a little encouragement. The Do Good Work Tee carries a simple reminder to put care into what you do. Style it with your everyday favorites and take that intention wherever you go.',
      material: '100% cotton', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: {
        'Rose Pink': { swatch: '#fec6d3', image: 'https://lh3.googleusercontent.com/d/1NhVKvwjI8gSpb7YPJI5maC-GDvTcFSxn', alt: 'Do Good Work Tee in Rose Pink' }
      },
      gallery: {
          detail: { image: 'https://lh3.googleusercontent.com/d/1XuNtdt5XltWf0XS03W1CaxNtKpTHChxR', alt: 'Close-up detail of the Do Good Work Tee', caption: 'The message' },
        fit: { image: 'https://lh3.googleusercontent.com/d/18VEB1ga2vzXi1D1aLKNHVGrpJs1F-d_n', alt: 'Fit and fabric view of the Do Good Work Tee', caption: '100% cotton' }
      },
      perks: ['100% cotton', 'Sizes XS–XXL'],
      fitDetails: 'Made from 100% cotton. Available in XS, S, M, L, XL, and XXL.'
    }
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const productPage = $('[data-product-page]');
  const productId = document.body.dataset.productId || (productPage ? productPage.dataset.productId : '');
  const currentProduct = PRODUCTS[productId];

  const cartDialogElement = $('#cartDialog');
  const navDrawerElement = $('#shopNav');
  const checkoutForm = $('#checkoutForm');
  const checkoutStatus = $('#checkoutStatus');
  const paymentError = $('#paymentError');
  const bagCount = $('#bagCount');
  const orderItems = $('#orderItems');
  const checkoutSubtotal = $('#checkoutSubtotal');
  const checkoutShipping = $('#checkoutShipping');
  const checkoutTotal = $('#checkoutTotal');

  let cart = loadCart();
  let selectedSize = null;
  let selectedColor = currentProduct ? Object.keys(currentProduct.colors)[0] : null;
  let quantity = 1;

  function currency(amount) {
    return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Cart Access Function: Loads saved items from browser storage.
  function loadCart() {
    let savedCart = [];
    try {
      savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch (error) {
      return [];
    }

    if (!Array.isArray(savedCart)) return [];

    const validCart = [];
    for (const item of savedCart) {
      if (item && PRODUCTS[item.productId] && Number.isFinite(Number(item.price)) && Number(item.quantity) > 0) {
        validCart.push({
          productId: item.productId,
          name: String(item.name || PRODUCTS[item.productId].name),
          price: Number(item.price), size: String(item.size || ''), color: String(item.color || ''),
          quantity: Math.max(1, Math.floor(Number(item.quantity)))
        });
      }
    }
    return validCart;
  }

  // Cart Saving Function: Saves the current cart into browser storage.
  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // Cart remains available on the current page if browser storage is unavailable.
    }
  }

  // Cart Quantity Function: Counts the total number of individual items.
  function getCartQuantity() {
    let total = 0;
    for (const item of cart) total += item.quantity;
    return total;
  }

  // Cart Subtotal Function: Calculates the combined product prices.
  function getCartSubtotal() {
    let total = 0;
    for (const item of cart) total += item.price * item.quantity;
    return total;
  }

  // Selection Function: Updates the selected state of buttons.
  function updateSelection(button, selector, parent = document) {
    const buttons = $$(selector, parent);
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
  }

  // Product Display Function: Displays the selected product and its options.
  function renderProduct(product) {
    if (!product) {
      const title = $('#productTitle');
      if (title) title.textContent = 'Product unavailable';
      return;
    }

    document.title = 'Eternetee — ' + product.name;
    $('#productTitle').textContent = product.name;
    $('#productDescription').textContent = product.description;
    $('#productDescriptionDetails').textContent = product.description;
    $('#productPrice').textContent = currency(product.price);
    $('#productMaterial').textContent = product.material;
    $('#productFitDetails').textContent = product.fitDetails;
    $('#breadcrumbCurrent').textContent = product.name;

    const mainImage = $('#mainProductImage');
    const detailImage = $('#detailProductImage');
    const fitImage = $('#fitProductImage');

    detailImage.src = product.gallery.detail.image;
    detailImage.alt = product.gallery.detail.alt;
    detailImage.nextElementSibling.textContent = product.gallery.detail.caption;
    fitImage.src = product.gallery.fit.image;
    fitImage.alt = product.gallery.fit.alt;
    fitImage.nextElementSibling.textContent = product.gallery.fit.caption;

    const colorOptions = $('#colorOptions');
    colorOptions.replaceChildren();

    for (const colorName of Object.keys(product.colors)) {
      const colorInfo = product.colors[colorName];
      const button = document.createElement('button');
      const dot = document.createElement('span');

      button.type = 'button';
      button.className = 'color-swatch';
      button.dataset.color = colorName;
      button.setAttribute('aria-label', colorName);
      button.setAttribute('aria-pressed', 'false');

      dot.className = 'swatch-dot';
      dot.style.backgroundColor = colorInfo.swatch;

      button.appendChild(dot);
      button.addEventListener('click', function () { selectColor(colorName); });
      colorOptions.appendChild(button);
    }

    const sizeOptions = $('#sizeOptions');
    sizeOptions.replaceChildren();

    for (const size of product.sizes) {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'size-button';
      button.dataset.size = size;
      button.textContent = size;
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', function () {
        selectedSize = size;
        updateSelection(button, '.size-button', sizeOptions);
        $('#sizeError').textContent = '';
      });

      sizeOptions.appendChild(button);
    }

    const perks = $('#productPerks');
    perks.replaceChildren();

    for (const perk of product.perks) {
      const item = document.createElement('span');
      item.textContent = perk;
      perks.appendChild(item);
    }

    selectColor(selectedColor, false);
    mainImage.addEventListener('error', function () { mainImage.classList.add('image-unavailable'); }, { once: true });
  }

  // Color Selection Function: Changes the main product image.
  function selectColor(colorName, updateButtons = true) {
    if (!currentProduct || !currentProduct.colors[colorName]) return;

    selectedColor = colorName;
    const colorInfo = currentProduct.colors[colorName];
    const mainImage = $('#mainProductImage');

    $('#selectedColor').textContent = colorName;
    mainImage.src = colorInfo.image;
    mainImage.alt = colorInfo.alt;
    mainImage.classList.remove('image-unavailable');

    if (updateButtons) {
      const buttons = $$('.color-swatch');
      for (const button of buttons) {
        if (button.dataset.color === colorName) updateSelection(button, '.color-swatch');
      }
    }
  }

  // Order Display Function: Updates the shopping bag and checkout summary.
  function renderOrder() {
    if (!orderItems) return;

    const itemCount = getCartQuantity();
    const subtotal = getCartSubtotal();
    const shipping = cart.length ? SHIPPING_FEE : 0;

    if (bagCount) bagCount.textContent = itemCount;
    if (checkoutSubtotal) checkoutSubtotal.textContent = currency(subtotal);
    if (checkoutShipping) checkoutShipping.textContent = currency(shipping);
    if (checkoutTotal) checkoutTotal.textContent = currency(subtotal + shipping);

    orderItems.replaceChildren();

    if (cart.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-order';
      emptyMessage.textContent = 'Your bag is currently empty. Choose a product, select its options, and select “Buy Now” to add it to your order.';
      orderItems.appendChild(emptyMessage);
      return;
    }

    for (let index = 0; index < cart.length; index++) {
      const item = cart[index];
      const product = PRODUCTS[item.productId];
      const colorInfo = product.colors[item.color];
      const line = document.createElement('div');
      const image = document.createElement('img');
      const details = document.createElement('div');
      const name = document.createElement('strong');
      const variant = document.createElement('small');
      const quantityText = document.createElement('small');
      const price = document.createElement('span');
      const removeButton = document.createElement('button');

      line.className = 'order-product';
      image.className = 'order-product-image';
      image.src = colorInfo ? colorInfo.image : product.colors[Object.keys(product.colors)[0]].image;
      image.alt = item.name + ' product image';

      details.className = 'order-product-details';
      name.textContent = item.name;
      variant.textContent = [item.color, item.size].filter(Boolean).join(' · ');
      quantityText.textContent = 'Quantity: ' + item.quantity;

      price.className = 'order-product-price';
      price.textContent = currency(item.price * item.quantity);

      details.append(name, variant, quantityText);

      removeButton.type = 'button';
      removeButton.className = 'remove-item-button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', 'Remove ' + item.name + ' from your order');
      removeButton.title = 'Remove item';

      removeButton.addEventListener('click', function () {
        cart.splice(index, 1);
        saveCart();
        if (checkoutStatus) checkoutStatus.textContent = '';
        renderOrder();
      });

      line.append(image, details, price, removeButton);
      orderItems.appendChild(line);
    }
  }

  // Cart Deposit Function: Adds the selected product to the shopping bag.
  function addCurrentProductToCart() {
    if (!currentProduct) return;

    if (!selectedSize) {
      $('#sizeError').textContent = 'Please select a size before continuing.';
      $('.size-button').focus();
      return;
    }

    let existingItem = null;

    for (const item of cart) {
      if (item.productId === currentProduct.id && item.size === selectedSize && item.color === selectedColor) {
        existingItem = item;
        break;
      }
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        size: selectedSize,
        color: selectedColor,
        quantity: quantity
      });
    }

    saveCart();
    if (checkoutStatus) checkoutStatus.textContent = '';
    renderOrder();

    if (cartDialogElement) Dialog.getOrCreateInstance(cartDialogElement).show();
  }

  // Navigation Function: Controls the mobile navigation drawer.
  function initializeNavigation() {
    const navToggle = $('#navToggle');
    const closeNav = $('#closeNav');

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

  // Cart Initialization Function: Opens and closes the shopping bag.
  function initializeCart() {
    renderOrder();

    if (!cartDialogElement) return;

    const dialog = Dialog.getOrCreateInstance(cartDialogElement);
    const openCart = $('#openCart');
    const closeCart = $('#closeCart');

    if (openCart) openCart.addEventListener('click', function () { dialog.show(); });
    if (closeCart) closeCart.addEventListener('click', function () { dialog.hide(); });

    cartDialogElement.addEventListener('show.bs.dialog', renderOrder);
  }

  // Product Controls Function: Activates quantity and purchase buttons.
  function initializeProductControls() {
    if (!productPage || !currentProduct) return;

    renderProduct(currentProduct);

    $('#decreaseQty').addEventListener('click', function () {
      quantity = Math.max(1, quantity - 1);
      $('#quantity').textContent = quantity;
    });

    $('#increaseQty').addEventListener('click', function () {
      quantity = Math.min(MAX_PAGE_QUANTITY, quantity + 1);
      $('#quantity').textContent = quantity;
    });

    $('#buyNow').addEventListener('click', addCurrentProductToCart);
  }

  // Email Order Function: Creates the order details and opens the customer's email application.
  function openOrderEmail(paymentSelected) {
    const customerDetails = [];
    const formData = new FormData(checkoutForm);

    for (const [name, value] of formData.entries()) {
      if (name === 'paymentMethod' || typeof value !== 'string') continue;

      const field = checkoutForm.elements.namedItem(name);
      const input = field instanceof RadioNodeList ? field[0] : field;

      if (input && ['hidden', 'submit', 'button', 'reset', 'password', 'file'].includes(input.type)) continue;

      const label = input && input.labels && input.labels.length
        ? input.labels[0].textContent.trim()
        : name.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());

      const fieldValue = value.trim();

      if (fieldValue) customerDetails.push(label + ': ' + fieldValue);
    }

    const paymentMethod = paymentSelected.labels && paymentSelected.labels.length
      ? paymentSelected.labels[0].textContent.trim()
      : paymentSelected.value;

    const orderDetails = cart.map((item, index) => {
      return [
        (index + 1) + '. ' + item.name,
        '   Color: ' + (item.color || 'Not specified'),
        '   Size: ' + (item.size || 'Not specified'),
        '   Quantity: ' + item.quantity,
        '   Unit Price: ' + currency(item.price),
        '   Item Total: ' + currency(item.price * item.quantity)
      ].join('\n');
    }).join('\n\n');

    const subtotal = getCartSubtotal();
    const shipping = cart.length ? SHIPPING_FEE : 0;
    const total = subtotal + shipping;

    const subject = 'New Order - Eternetee';

    const body = [
      'Hello Eternetee,',
      '',
      'I would like to place the following order:',
      '',
      'CUSTOMER DETAILS',
      customerDetails.length ? customerDetails.join('\n') : 'No customer details provided.',
      'Payment Method: ' + paymentMethod,
      '',
      'ORDER SUMMARY',
      orderDetails,
      '',
      'Subtotal: ' + currency(subtotal),
      'Shipping Fee: ' + currency(shipping),
      'Total Amount: ' + currency(total),
      '',
      'Please confirm my order. Thank you.'
    ].join('\n');

    const emailLink = 'mailto:' + ORDER_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    checkoutStatus.textContent = 'Opening your email application with your order details...';
    window.location.href = emailLink;
  }

  // Checkout Validation Function: Checks the customer's submitted information.
  function initializeCheckout() {
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', function (event) {
      event.preventDefault();
      checkoutStatus.textContent = '';
      paymentError.hidden = true;

      if (cart.length === 0) {
        checkoutStatus.textContent = 'Your bag is empty. Add a product before placing an order.';
        return;
      }

      const paymentSelected = $('input[name="paymentMethod"]:checked', checkoutForm);

      if (!paymentSelected) paymentError.hidden = false;

      if (!checkoutForm.checkValidity() || !paymentSelected) {
        checkoutForm.classList.add('was-validated');
        checkoutForm.reportValidity();
        return;
      }

      openOrderEmail(paymentSelected);
    });

    const paymentOptions = $$('input[name="paymentMethod"]', checkoutForm);

    for (const radio of paymentOptions) {
      radio.addEventListener('change', function () {
        paymentError.hidden = true;
      });
    }
  }

  // Main Program Sequence:
  initializeNavigation();
  initializeCart();
  initializeProductControls();
  initializeCheckout();
})();
