/**
 * FreshBasket Product Listing & Filtering Controller
 * Renders product grid, sidebar filters, sorting, search, grid/list view toggling.
 */

class ProductCatalogController {
  constructor() {
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.currentSort = 'popular';
    this.currentMaxPrice = 100;
    this.selectedBrands = [];
    this.selectedDietary = [];
    this.selectedRating = 0;
    this.viewMode = 'grid';
    this.init();
  }

  init() {
    this.bindEvents();
    this.parseURLParams();
    this.renderCatalog();
  }

  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) {
      this.currentCategory = params.get('category');
    }
    if (params.has('search')) {
      this.currentSearch = params.get('search');
    }
    if (params.has('deal')) {
      this.currentCategory = 'deals';
    }
  }

  renderProductCard(p) {
    const isFav = window.wishlistManager ? window.wishlistManager.hasItem(p.id) : false;
    const safeName = (p.name || '').replace(/"/g, '&quot;');
    const fallbackImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    
    if (this.viewMode === 'list') {
      return `
        <div class="product-card flex flex-col sm:flex-row items-center p-4 gap-6">
          <div class="product-img-wrapper w-full sm:w-48 h-48 rounded-xl flex-shrink-0">
            <img src="${p.image}" alt="${safeName}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';" />
            ${p.discount ? `<span class="absolute top-2 left-2 badge-discount">-${p.discount}% OFF</span>` : ''}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded">${p.category}</span>
              ${p.tags && p.tags.includes('Organic') ? '<span class="badge-organic">Organic</span>' : ''}
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1 hover:text-green-600 transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">${p.weight} • ${p.brand}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">${p.description || ''}</p>
            <div class="flex items-center gap-1 text-amber-400 text-xs mb-4">
              <i class="fa-solid fa-star"></i>
              <span class="font-bold text-slate-800 dark:text-white">${p.rating}</span>
              <span class="text-slate-400">(${p.reviewCount} reviews)</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <div>
                <span class="text-2xl font-extrabold text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
                ${p.originalPrice ? `<span class="text-sm text-slate-400 line-through ml-2">$${p.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              <div class="flex items-center gap-2">
                <button data-product-id="${p.id}" class="wishlist-toggle-btn w-10 h-10 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
                  <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-600 dark:text-slate-400'}"></i>
                </button>
                <button class="add-to-cart-btn btn-primary" data-product-id="${p.id}">
                  <i class="fa-solid fa-basket-shopping"></i> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="product-card flex flex-col justify-between">
        <div>
          <div class="product-img-wrapper">
            <img src="${p.image}" alt="${safeName}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';" />
            ${p.discount ? `<span class="absolute top-3 left-3 badge-discount">-${p.discount}% OFF</span>` : ''}
            <button data-product-id="${p.id}" class="wishlist-toggle-btn absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-600 dark:text-slate-400'}"></i>
            </button>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase truncate">${p.brand}</span>
              <div class="flex items-center gap-1 text-xs text-amber-400">
                <i class="fa-solid fa-star"></i>
                <span class="font-bold text-slate-700 dark:text-slate-300">${p.rating}</span>
              </div>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base leading-snug mb-1 line-clamp-2 hover:text-green-600 transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">${p.weight}</p>
          </div>
        </div>
        <div class="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <div class="flex items-center justify-between pt-3">
            <div>
              <span class="text-lg font-extrabold text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
              ${p.originalPrice ? `<span class="text-xs text-slate-400 line-through ml-1.5">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="add-to-cart-btn btn-primary text-xs px-3.5 py-2 min-h-0" data-product-id="${p.id}">
              <i class="fa-solid fa-plus mr-1"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredProducts() {
    if (!window.productsData) return [];
    let list = [...window.productsData];

    // Category filter
    if (this.currentCategory !== 'all') {
      if (this.currentCategory === 'deals') {
        list = list.filter(p => p.isWeeklyDeal);
      } else {
        const cat = this.currentCategory.toLowerCase();
        list = list.filter(p => 
          (p.categoryId && p.categoryId.toLowerCase() === cat) ||
          (p.category && p.category.toLowerCase() === cat) ||
          (p.category && p.category.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(cat)) ||
          (cat.includes('fruit') && (p.categoryId === 'fruits-veggies' || (p.category && p.category.includes('Fruit')))) ||
          (cat.includes('dairy') && (p.categoryId === 'dairy-eggs' || (p.category && p.category.includes('Dairy')))) ||
          (cat.includes('meat') && (p.categoryId === 'meat-seafood' || (p.category && p.category.includes('Meat')))) ||
          (cat.includes('baker') && (p.categoryId === 'bakery' || (p.category && p.category.includes('Bakery'))))
        );
      }
    }

    // Search query filter
    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    // Max price filter
    if (this.currentMaxPrice) {
      list = list.filter(p => p.price <= this.currentMaxPrice);
    }

    // Brand filter
    if (this.selectedBrands.length > 0) {
      list = list.filter(p => this.selectedBrands.includes(p.brand));
    }

    // Dietary filter
    if (this.selectedDietary.length > 0) {
      list = list.filter(p => p.dietary && p.dietary.some(d => this.selectedDietary.includes(d)));
    }

    // Sort order
    if (this.currentSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.currentSort === 'newest') {
      list.sort((a, b) => b.id.localeCompare(a.id));
    }

    return list;
  }

  renderCatalog() {
    const grid = document.getElementById('shop-product-grid');
    const countEl = document.getElementById('shop-product-count');
    if (!grid) return;

    const filtered = this.getFilteredProducts();
    if (countEl) countEl.innerText = `${filtered.length} products found`;

    if (filtered.length === 0) {
      grid.className = 'w-full py-16 text-center';
      grid.innerHTML = `
        <div class="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No products match your filter</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Try resetting your price range or adjusting selected category filters.</p>
          <button onclick="productCatalog.resetFilters()" class="btn-secondary text-sm">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.className = this.viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'
      : 'flex flex-col gap-4';

    grid.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
  }

  resetFilters() {
    this.currentCategory = 'all';
    this.currentSearch = '';
    this.currentMaxPrice = 20;
    this.selectedBrands = [];
    this.selectedDietary = [];
    this.selectedRating = 0;
    
    const priceRange = document.getElementById('filter-price-range');
    if (priceRange) priceRange.value = 20;
    const priceVal = document.getElementById('filter-price-val');
    if (priceVal) priceVal.innerText = '$20';

    this.renderCatalog();
  }

  bindEvents() {
    // Sort dropdown change
    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderCatalog();
      });
    }

    // View toggle buttons
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    if (gridBtn && listBtn) {
      gridBtn.addEventListener('click', () => {
        this.viewMode = 'grid';
        gridBtn.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-green-600 text-white';
        listBtn.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500';
        this.renderCatalog();
      });
      listBtn.addEventListener('click', () => {
        this.viewMode = 'list';
        listBtn.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-green-600 text-white';
        gridBtn.className = 'w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500';
        this.renderCatalog();
      });
    }

    // Price range filter
    const priceRange = document.getElementById('filter-price-range');
    const priceVal = document.getElementById('filter-price-val');
    if (priceRange && priceVal) {
      priceRange.addEventListener('input', (e) => {
        this.currentMaxPrice = parseFloat(e.target.value);
        priceVal.innerText = `$${this.currentMaxPrice}`;
        this.renderCatalog();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.productCatalog = new ProductCatalogController();
});
