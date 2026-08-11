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
    this.parseURLParams();
    this.bindEvents();
    this.syncUIWithFilters();
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

  syncUIWithFilters() {
    // Sync Category Radio
    const catRadios = document.querySelectorAll('input[name="cat-filter"]');
    catRadios.forEach(radio => {
      const val = radio.value;
      if (val === this.currentCategory || (radio.getAttribute('onclick') && radio.getAttribute('onclick').includes(`'${this.currentCategory}'`))) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    });

    // Sync Price Range
    const priceRange = document.getElementById('filter-price-range');
    const priceVal = document.getElementById('filter-price-val');
    if (priceRange) priceRange.value = this.currentMaxPrice;
    if (priceVal) priceVal.innerText = `$${this.currentMaxPrice}`;

    // Sync Dietary Checkboxes
    const dietaryInputs = document.querySelectorAll('input[data-dietary]');
    dietaryInputs.forEach(input => {
      const val = input.getAttribute('data-dietary');
      input.checked = this.selectedDietary.includes(val);
    });
  }

  renderProductCard(p) {
    const isFav = window.wishlistManager ? window.wishlistManager.hasItem(p.id) : false;
    const safeName = (p.name || '').replace(/"/g, '&quot;');
    const hasImage = Boolean(p.image && p.image.trim());
    
    if (this.viewMode === 'list') {
      return `
        <div class="product-card product-card-list flex flex-row items-center p-3 sm:p-4 gap-3 sm:gap-5 cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-green-500 transition-all overflow-hidden" onclick="if(!event.target.closest('.add-to-cart-btn') && !event.target.closest('.wishlist-toggle-btn')) window.location.href='product.html?id=${p.id}'">
          ${hasImage ? `
          <div class="product-img-wrapper w-28 h-28 sm:w-36 sm:h-36 rounded-xl flex-shrink-0 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
            <a href="product.html?id=${p.id}" class="absolute inset-0 w-full h-full block overflow-hidden">
              <img src="${p.image}" alt="${safeName}" loading="lazy" class="w-full h-full object-cover object-center" />
            </a>
            ${p.discount ? `<span class="absolute top-2 left-2 badge-discount text-[10px] sm:text-xs px-1.5 py-0.5 z-10">-${p.discount}% OFF</span>` : ''}
          </div>
          ` : ''}
          <div class="flex-1 min-w-0 py-0.5 flex flex-col justify-between self-stretch">
            <div>
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[10px] sm:text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded">${p.category}</span>
                  ${!hasImage && p.discount ? `<span class="badge-discount text-[10px] sm:text-xs px-1.5 py-0.5">-${p.discount}% OFF</span>` : ''}
                  ${p.tags && p.tags.includes('Organic') ? '<span class="badge-organic text-[10px] sm:text-xs px-1.5 py-0.5">Organic</span>' : ''}
                </div>
                <button data-product-id="${p.id}" class="wishlist-toggle-btn w-8 h-8 sm:w-9 sm:h-9 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                  <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-500 dark:text-slate-400'} text-xs sm:text-sm"></i>
                </button>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5 hover:text-green-600 transition-colors line-clamp-1">
                <a href="product.html?id=${p.id}">${p.name}</a>
              </h3>
              <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1.5">${p.weight} • ${p.brand}</p>
              ${p.description ? `<p class="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-1 hidden sm:block">${p.description}</p>` : ''}
            </div>
            <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-auto min-w-0">
              <div class="flex items-baseline gap-1 min-w-0 flex-shrink">
                <span class="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">$${p.price.toFixed(2)}</span>
                ${p.originalPrice ? `<span class="text-[10px] text-slate-400 line-through whitespace-nowrap">$${p.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              <button class="add-to-cart-btn btn-primary text-[11px] px-2 py-1 min-h-0 flex-shrink-0" data-product-id="${p.id}">
                <i class="fa-solid fa-basket-shopping text-[10px]"></i> <span class="ml-0.5 font-bold">Add</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="product-card flex flex-col justify-between cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-green-500 transition-all overflow-hidden ${hasImage ? '' : 'p-4 sm:p-5'}" onclick="if(!event.target.closest('.add-to-cart-btn') && !event.target.closest('.wishlist-toggle-btn')) window.location.href='product.html?id=${p.id}'">
        <div>
          ${hasImage ? `
          <div class="product-img-wrapper cursor-pointer relative w-full aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
            <a href="product.html?id=${p.id}" class="absolute inset-0 w-full h-full block overflow-hidden">
              <img src="${p.image}" alt="${safeName}" loading="lazy" class="w-full h-full object-cover object-center" />
            </a>
            ${p.discount ? `<span class="absolute top-2.5 left-2.5 badge-discount z-10 text-xs px-2 py-0.5">-${p.discount}% OFF</span>` : ''}
            <button data-product-id="${p.id}" class="wishlist-toggle-btn absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
              <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-600 dark:text-slate-400'} text-xs sm:text-sm"></i>
            </button>
          </div>
          <div class="p-3 sm:p-4">
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">${p.brand}</span>
              <div class="flex items-center gap-1 text-[11px] sm:text-xs text-amber-400">
                <i class="fa-solid fa-star text-[10px] sm:text-xs"></i>
                <span class="font-bold text-slate-700 dark:text-slate-300">${p.rating}</span>
              </div>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-1 line-clamp-2 hover:text-green-600 transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2">${p.weight}</p>
          </div>
          ` : `
          <div>
            <div class="flex items-center justify-between gap-1 mb-2">
              <span class="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase truncate">${p.brand}</span>
              <div class="flex items-center gap-2">
                ${p.discount ? `<span class="badge-discount text-[10px] sm:text-xs px-2 py-0.5">-${p.discount}% OFF</span>` : ''}
                <div class="flex items-center gap-1 text-[11px] sm:text-xs text-amber-400">
                  <i class="fa-solid fa-star text-[10px] sm:text-xs"></i>
                  <span class="font-bold text-slate-700 dark:text-slate-300">${p.rating}</span>
                </div>
                <button data-product-id="${p.id}" class="wishlist-toggle-btn w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 dark:bg-slate-700/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-600 dark:text-slate-400'} text-xs"></i>
                </button>
              </div>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-1 line-clamp-2 hover:text-green-600 transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3">${p.weight}</p>
          </div>
          `}
        </div>
        <div class="${hasImage ? 'p-3 sm:p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80' : 'pt-3 border-t border-slate-100 dark:border-slate-800/80'} mt-auto">
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-baseline gap-1">
              <span class="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
              ${p.originalPrice ? `<span class="text-[10px] text-slate-400 line-through">$${p.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="add-to-cart-btn btn-primary text-xs px-2.5 py-1 min-h-0" data-product-id="${p.id}">
              <i class="fa-solid fa-plus mr-0.5 text-[10px]"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredProducts() {
    if (!window.productsData) return [];
    let list = [...window.productsData];

    // Category filter - STRICT MATCHING
    if (this.currentCategory && this.currentCategory !== 'all') {
      if (this.currentCategory === 'deals') {
        list = list.filter(p => p.isWeeklyDeal);
      } else {
        const targetCat = this.currentCategory.toLowerCase().trim();
        list = list.filter(p => {
          const pCatId = (p.categoryId || '').toLowerCase().trim();
          const pCat = (p.category || '').toLowerCase().trim();

          // Direct categoryId / category match
          if (pCatId === targetCat || pCat === targetCat) return true;

          // Fruits & Vegetables
          if (targetCat === 'fruits-veggies' || targetCat === 'fruits' || targetCat === 'vegetables' || targetCat === 'produce') {
            return pCatId === 'fruits-veggies' || pCat.includes('fruit') || pCat.includes('vegetable');
          }
          // Dairy & Eggs
          if (targetCat === 'dairy-eggs' || targetCat === 'dairy' || targetCat === 'eggs') {
            return pCatId === 'dairy-eggs' || pCat.includes('dairy') || pCat.includes('egg');
          }
          // Meat & Seafood
          if (targetCat === 'meat-seafood' || targetCat === 'meat' || targetCat === 'seafood') {
            return pCatId === 'meat-seafood' || pCat.includes('meat') || pCat.includes('seafood') || pCat.includes('fish');
          }
          // Bakery
          if (targetCat === 'bakery' || targetCat === 'bread') {
            return pCatId === 'bakery' || pCat.includes('bakery') || pCat.includes('bread');
          }
          // Pantry Staples
          if (targetCat === 'pantry' || targetCat === 'pantry-staples' || targetCat === 'groceries' || targetCat === 'oil' || targetCat === 'honey') {
            return pCatId === 'pantry' || pCat.includes('pantry') || pCat.includes('staple');
          }
          // Beverages
          if (targetCat === 'beverages' || targetCat === 'drinks') {
            return pCatId === 'beverages' || pCat.includes('beverage') || pCat.includes('drink');
          }
          // Snacks & Sweets
          if (targetCat === 'snacks' || targetCat === 'sweets') {
            return pCatId === 'snacks' || pCat.includes('snack') || pCat.includes('sweet');
          }
          // Frozen Foods
          if (targetCat === 'frozen') {
            return pCatId === 'frozen' || pCat.includes('frozen');
          }

          return pCat.replace(/[^a-z0-9]/g, '-').includes(targetCat);
        });
      }
    }

    // Search query filter
    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q));
    }

    // Max price filter
    if (this.currentMaxPrice) {
      list = list.filter(p => p.price <= this.currentMaxPrice);
    }

    // Brand filter
    if (this.selectedBrands && this.selectedBrands.length > 0) {
      list = list.filter(p => this.selectedBrands.includes(p.brand));
    }

    // Dietary filter
    if (this.selectedDietary && this.selectedDietary.length > 0) {
      list = list.filter(p => {
        const itemDiet = (p.dietary || []).map(d => d.toLowerCase());
        const itemTags = (p.tags || []).map(t => t.toLowerCase());
        const itemName = (p.name || '').toLowerCase();
        
        return this.selectedDietary.every(selectedKey => {
          const key = selectedKey.toLowerCase();
          if (key.includes('organic')) {
            return itemDiet.some(d => d.includes('organic')) || itemTags.some(t => t.includes('organic')) || itemName.includes('organic');
          }
          if (key.includes('gluten')) {
            return itemDiet.some(d => d.includes('gluten')) || itemTags.some(t => t.includes('gluten')) || itemName.includes('gluten');
          }
          if (key.includes('vegan')) {
            return itemDiet.some(d => d.includes('vegan') || d.includes('plant')) || itemTags.some(t => t.includes('vegan')) || itemName.includes('vegan');
          }
          if (key.includes('keto')) {
            return itemDiet.some(d => d.includes('keto')) || itemTags.some(t => t.includes('keto')) || itemName.includes('keto');
          }
          return itemDiet.some(d => d.includes(key)) || itemTags.some(t => t.includes(key));
        });
      });
    }

    // Sort order
    if (this.currentSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.currentSort === 'newest') {
      list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    }

    return list;
  }

  toggleDietary(key) {
    const idx = this.selectedDietary.indexOf(key);
    if (idx > -1) {
      this.selectedDietary.splice(idx, 1);
    } else {
      this.selectedDietary.push(key);
    }
    this.renderCatalog();
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
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Try resetting your price range or adjusting selected category and dietary filters.</p>
          <button onclick="productCatalog.resetFilters()" class="btn-secondary text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold rounded-xl transition-colors">Reset All Filters</button>
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
    this.currentMaxPrice = 100;
    this.selectedBrands = [];
    this.selectedDietary = [];
    this.selectedRating = 0;
    this.currentSort = 'popular';
    
    // Reset Price Range Slider
    const priceRange = document.getElementById('filter-price-range');
    if (priceRange) priceRange.value = 100;
    const priceVal = document.getElementById('filter-price-val');
    if (priceVal) priceVal.innerText = '$100';

    // Reset Category Radio Buttons
    const catRadios = document.querySelectorAll('input[name="cat-filter"]');
    catRadios.forEach(radio => {
      if (radio.value === 'all' || (radio.getAttribute('onclick') && radio.getAttribute('onclick').includes("'all'"))) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    });

    // Reset Dietary Checkboxes
    const dietaryInputs = document.querySelectorAll('input[data-dietary]');
    dietaryInputs.forEach(input => {
      input.checked = false;
    });

    // Reset Sort dropdown select
    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

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
