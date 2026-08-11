/**
 * FreshBasket Wishlist Manager
 * Manages user saved items, header badge indicators, and localStorage persistence.
 */

class WishlistManager {
  constructor() {
    this.storageKey = 'freshbasket_wishlist';
    this.items = this.loadWishlist();
    this.init();
  }

  init() {
    this.updateBadges();
    this.renderWishlistPage();
    this.bindEvents();
  }

  loadWishlist() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : ["prod-2", "prod-5", "prod-12"]; // Seed sample favorites
  }

  saveWishlist() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    this.updateBadges();
    this.renderWishlistPage();
  }

  hasItem(id) {
    return this.items.includes(id);
  }

  toggleItem(id) {
    if (this.hasItem(id)) {
      this.items = this.items.filter(i => i !== id);
      if (window.showToast) window.showToast('Removed item from your wishlist.', 'info');
    } else {
      this.items.push(id);
      if (window.showToast) window.showToast('Added item to your wishlist!', 'success');
    }
    this.saveWishlist();
    this.updateCardHeartBtns(id);
  }

  updateBadges() {
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach(b => {
      b.innerText = this.items.length;
      b.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  }

  updateCardHeartBtns(id) {
    const btns = document.querySelectorAll(`.wishlist-toggle-btn[data-product-id="${id}"]`);
    btns.forEach(btn => {
      const isFav = this.hasItem(id);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-600 dark:text-slate-400';
      }
    });
  }

  renderWishlistPage() {
    const container = document.getElementById('wishlist-grid');
    if (!container || !window.productsData) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            <i class="fa-regular fa-heart"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Your Wishlist is Empty</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Explore our fresh grocery collections and click the heart icon on any product to save it for later.</p>
          <a href="shop.html" class="btn-primary px-8">Discover Groceries</a>
        </div>
      `;
    } else {
      const favProducts = window.productsData.filter(p => this.items.includes(p.id));
      container.innerHTML = favProducts.map(p => `
        <div class="product-card flex flex-col justify-between cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm ${p.image ? '' : 'p-4 sm:p-5'}" onclick="if(!event.target.closest('.btn-primary') && !event.target.closest('button')) window.location.href='product.html?id=${p.id}'">
          ${p.image ? `
          <div class="product-img-wrapper cursor-pointer relative w-full aspect-square overflow-hidden">
            <a href="product.html?id=${p.id}" class="absolute inset-0 w-full h-full block overflow-hidden">
              <img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover object-center" />
            </a>
            <button onclick="wishlistManager.toggleItem('${p.id}')" class="wishlist-toggle-btn absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
              <i class="fa-solid fa-heart text-red-500"></i>
            </button>
          </div>
          <div class="p-4">
            <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">${p.category}</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-base mt-1 mb-2 line-clamp-1">${p.name}</h4>
            <div class="flex items-center justify-between mt-3">
              <span class="text-lg font-extrabold text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
              <button onclick="cartManager.addItem(productsData.find(x => x.id === '${p.id}'))" class="btn-primary text-xs px-3 py-1.5 min-h-0">
                <i class="fa-solid fa-basket-shopping"></i> Add
              </button>
            </div>
          </div>
          ` : `
          <div>
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">${p.category}</span>
              <button onclick="wishlistManager.toggleItem('${p.id}')" class="wishlist-toggle-btn w-7 h-7 bg-slate-100 dark:bg-slate-700/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <i class="fa-solid fa-heart text-red-500 text-xs"></i>
              </button>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white text-base mb-2 line-clamp-1">${p.name}</h4>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span class="text-lg font-extrabold text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
            <button onclick="cartManager.addItem(productsData.find(x => x.id === '${p.id}'))" class="btn-primary text-xs px-3 py-1.5 min-h-0">
              <i class="fa-solid fa-basket-shopping"></i> Add
            </button>
          </div>
          `}
        </div>
      `).join('');
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.wishlist-toggle-btn');
      if (btn) {
        const id = btn.dataset.productId;
        if (id) this.toggleItem(id);
      }
    });
  }
}

// Global instance
window.wishlistManager = new WishlistManager();
