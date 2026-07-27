/**
 * FreshBasket Cart Manager
 * Manages shopping cart state, price calculations, free shipping progress, coupon codes, and localStorage persistence.
 */

class CartManager {
  constructor() {
    this.storageKey = 'freshbasket_cart';
    this.couponKey = 'freshbasket_coupon';
    this.freeShippingThreshold = 50.00;
    this.deliveryFee = 3.99;
    this.taxRate = 0.05; // 5%
    this.items = this.loadCart();
    this.appliedCoupon = JSON.parse(localStorage.getItem(this.couponKey)) || null;
    this.init();
  }

  init() {
    this.updateBadges();
    this.renderCartDrawer();
    this.renderCartPage();
    this.bindEvents();
  }

  loadCart() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : [
      // Seed default items for immediate demo rich experience
      { id: "prod-1", name: "Organic Cavendish Bananas", price: 1.99, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80", weight: "1 bunch (approx. 3 lbs)", quantity: 2 },
      { id: "prod-6", name: "Fresh Whole Milk 1 Gallon", price: 3.89, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80", weight: "1 Gallon (128 fl oz)", quantity: 1 },
      { id: "prod-14", name: "Artisanal Sourdough Bread", price: 4.49, image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80", weight: "24 oz loaf", quantity: 1 }
    ];
  }

  saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    if (this.appliedCoupon) {
      localStorage.setItem(this.couponKey, JSON.stringify(this.appliedCoupon));
    } else {
      localStorage.removeItem(this.couponKey);
    }
    this.updateBadges();
    this.renderCartDrawer();
    this.renderCartPage();
  }

  addItem(product, qty = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        weight: product.weight || '',
        quantity: qty
      });
    }
    this.saveCart();
    if (window.showToast) {
      window.showToast(`Added "${product.name}" to your cart!`, 'success');
    }
  }

  removeItem(id) {
    const item = this.items.find(i => i.id === id);
    this.items = this.items.filter(i => i.id !== id);
    this.saveCart();
    if (window.showToast && item) {
      window.showToast(`Removed "${item.name}" from cart.`, 'info');
    }
  }

  updateQuantity(id, qty) {
    if (qty <= 0) {
      this.removeItem(id);
      return;
    }
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.quantity = qty;
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.appliedCoupon = null;
    this.saveCart();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscountAmount() {
    const subtotal = this.getSubtotal();
    if (!this.appliedCoupon) return 0;
    if (this.appliedCoupon.type === 'percent') {
      return (subtotal * this.appliedCoupon.value) / 100;
    }
    if (this.appliedCoupon.type === 'fixed') {
      return Math.min(subtotal, this.appliedCoupon.value);
    }
    return 0;
  }

  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0 || subtotal >= this.freeShippingThreshold) {
      return 0.00;
    }
    return this.deliveryFee;
  }

  getTaxAmount() {
    const subtotalAfterDiscount = Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    return subtotalAfterDiscount * this.taxRate;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    const tax = this.getTaxAmount();
    return Math.max(0, subtotal - discount + shipping + tax);
  }

  applyCoupon(code) {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'FRESH10') {
      this.appliedCoupon = { code: 'FRESH10', type: 'percent', value: 10, label: '10% OFF' };
      this.saveCart();
      if (window.showToast) window.showToast('Coupon FRESH10 applied (10% OFF)!', 'success');
      return true;
    }
    if (cleanCode === 'WELCOME20') {
      this.appliedCoupon = { code: 'WELCOME20', type: 'percent', value: 20, label: '20% OFF' };
      this.saveCart();
      if (window.showToast) window.showToast('Coupon WELCOME20 applied (20% OFF)!', 'success');
      return true;
    }
    if (cleanCode === 'FREESHIP') {
      this.appliedCoupon = { code: 'FREESHIP', type: 'fixed', value: 3.99, label: 'Free Shipping' };
      this.saveCart();
      if (window.showToast) window.showToast('Coupon FREESHIP applied!', 'success');
      return true;
    }
    if (window.showToast) window.showToast('Invalid coupon code. Try FRESH10 or WELCOME20', 'danger');
    return false;
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.saveCart();
    if (window.showToast) window.showToast('Coupon removed.', 'info');
  }

  updateBadges() {
    const totalCount = this.items.reduce((sum, i) => sum + i.quantity, 0);
    const cartBadges = document.querySelectorAll('.cart-count-badge');
    cartBadges.forEach(b => {
      b.innerText = totalCount;
      b.style.display = totalCount > 0 ? 'flex' : 'none';
    });
  }

  renderCartDrawer() {
    const drawerContainer = document.getElementById('cart-drawer-items');
    const drawerSubtotal = document.getElementById('cart-drawer-subtotal');
    const drawerTotal = document.getElementById('cart-drawer-total');
    const progressText = document.getElementById('cart-free-shipping-text');
    const progressBar = document.getElementById('cart-free-shipping-bar');

    if (!drawerContainer) return;

    const subtotal = this.getSubtotal();
    const remaining = this.freeShippingThreshold - subtotal;
    const progressPercent = Math.min(100, (subtotal / this.freeShippingThreshold) * 100);

    if (progressText && progressBar) {
      if (subtotal >= this.freeShippingThreshold) {
        progressText.innerHTML = '<span class="text-green-600 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> You unlocked FREE Delivery!</span>';
        progressBar.style.width = '100%';
        progressBar.className = 'bg-green-600 h-2 rounded-full transition-all duration-300';
      } else {
        progressText.innerHTML = `Add <span class="font-bold text-slate-900 dark:text-white">$${remaining.toFixed(2)}</span> more to unlock <span class="text-green-600 font-bold">FREE Delivery</span>`;
        progressBar.style.width = `${progressPercent}%`;
        progressBar.className = 'bg-amber-500 h-2 rounded-full transition-all duration-300';
      }
    }

    if (this.items.length === 0) {
      drawerContainer.innerHTML = `
        <div class="py-12 text-center">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h4 class="font-bold text-slate-800 dark:text-white text-lg mb-1">Your cart is empty</h4>
          <p class="text-slate-500 text-sm mb-6">Looks like you haven't added any fresh groceries yet.</p>
          <a href="../pages/shop.html" class="btn-primary inline-flex text-sm">Start Shopping</a>
        </div>
      `;
    } else {
      drawerContainer.innerHTML = this.items.map(item => `
        <div class="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h5 class="text-sm font-bold text-slate-900 dark:text-white truncate">${item.name}</h5>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-2">${item.weight}</p>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-green-600 dark:text-green-400">$${item.price.toFixed(2)}</span>
              <span class="text-xs text-slate-400">×</span>
              <div class="flex items-center border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900">
                <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-md text-xs">-</button>
                <span class="w-6 text-center text-xs font-semibold dark:text-white">${item.quantity}</span>
                <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" class="w-6 h-6 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-md text-xs">+</button>
              </div>
            </div>
          </div>
          <button onclick="cartManager.removeItem('${item.id}')" class="text-slate-400 hover:text-red-500 p-1" title="Remove">
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      `).join('');
    }

    if (drawerSubtotal) drawerSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    if (drawerTotal) drawerTotal.innerText = `$${this.getTotal().toFixed(2)}`;
  }

  renderCartPage() {
    const tableBody = document.getElementById('cart-page-items');
    const subtotalEl = document.getElementById('cart-summary-subtotal');
    const discountEl = document.getElementById('cart-summary-discount');
    const shippingEl = document.getElementById('cart-summary-shipping');
    const taxEl = document.getElementById('cart-summary-tax');
    const totalEl = document.getElementById('cart-summary-total');

    if (!tableBody) return;

    if (this.items.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-16 text-center">
            <div class="w-20 h-20 bg-green-50 dark:bg-green-950/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <i class="fa-solid fa-basket-shopping"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Shopping Cart is Empty</h3>
            <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Explore our wide selection of fresh organic produce, bakery favorites, and daily essentials.</p>
            <a href="shop.html" class="btn-primary px-8">Browse Products</a>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = this.items.map(item => `
        <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
          <td class="py-4 pl-4" data-label="Product">
            <div class="flex items-center gap-4">
              <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
              <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-base">${item.name}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">${item.weight}</p>
                <button onclick="wishlistManager.toggleItem('${item.id}')" class="text-xs text-green-600 hover:underline mt-1 inline-flex items-center gap-1">
                  <i class="fa-regular fa-heart"></i> Save to Wishlist
                </button>
              </div>
            </div>
          </td>
          <td class="py-4 font-semibold text-slate-800 dark:text-slate-200" data-label="Price">$${item.price.toFixed(2)}</td>
          <td class="py-4" data-label="Quantity">
            <div class="inline-flex items-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900">
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg text-sm">-</button>
              <span class="w-10 text-center font-bold text-slate-900 dark:text-white text-sm">${item.quantity}</span>
              <button onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})" class="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r-lg text-sm">+</button>
            </div>
          </td>
          <td class="py-4 font-bold text-slate-900 dark:text-white text-base" data-label="Subtotal">$${(item.price * item.quantity).toFixed(2)}</td>
          <td class="py-4 pr-4 text-right" data-label="Remove">
            <button onclick="cartManager.removeItem('${item.id}')" class="text-slate-400 hover:text-red-500 p-2 transition-colors">
              <i class="fa-solid fa-trash-can text-lg"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }

    if (subtotalEl) subtotalEl.innerText = `$${this.getSubtotal().toFixed(2)}`;
    if (discountEl) discountEl.innerText = `-$${this.getDiscountAmount().toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = this.getShippingFee() === 0 ? 'FREE' : `$${this.getShippingFee().toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${this.getTaxAmount().toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${this.getTotal().toFixed(2)}`;
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      // Add to cart buttons
      const addBtn = e.target.closest('.add-to-cart-btn');
      if (addBtn) {
        const prodId = addBtn.dataset.productId;
        if (window.productsData && prodId) {
          const product = window.productsData.find(p => p.id === prodId);
          if (product) this.addItem(product, 1);
        }
      }
    });

    // Coupon form submission
    const couponForm = document.getElementById('cart-coupon-form');
    if (couponForm) {
      couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('cart-coupon-input');
        if (input && input.value) {
          this.applyCoupon(input.value);
        }
      });
    }
  }
}

// Global instance
window.cartManager = new CartManager();
