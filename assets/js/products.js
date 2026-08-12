/**
 * FreshBasket Product Listing & Filtering Controller
 * Renders product grid, offcanvas filter drawer, dark sidebar filters, sorting, search, grid/list view toggling.
 */

class ProductCatalogController {
  constructor() {
    this.selectedCategories = [];
    this.selectedType = 'all';
    this.currentSearch = '';
    this.currentSort = 'popular';
    this.currentMaxPrice = 100;
    this.selectedBrands = [];
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
      const cat = params.get('category');
      if (cat && cat !== 'all') {
        this.selectedCategories = [cat];
      }
    }
    if (params.has('search')) {
      this.currentSearch = params.get('search');
    }
    if (params.has('deal')) {
      this.selectedType = 'deals';
    }
  }

  // Toggle Offcanvas Filter Drawer (Image 1)
  openFilterDrawer() {
    const overlay = document.getElementById('filter-drawer-overlay');
    const drawer = document.getElementById('filter-drawer');
    if (overlay) overlay.classList.remove('hidden');
    if (drawer) {
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0');
    }
    document.body.style.overflow = 'hidden';
  }

  closeFilterDrawer() {
    const overlay = document.getElementById('filter-drawer-overlay');
    const drawer = document.getElementById('filter-drawer');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('-translate-x-full');
    }
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Toggle Accordion Filter Section inside Drawer / Sidebar
  toggleFilterSection(sectionId) {
    const section = document.getElementById(sectionId);
    const chevron = document.getElementById(`${sectionId}-chevron`);
    if (section) {
      section.classList.toggle('hidden');
    }
    if (chevron) {
      chevron.classList.toggle('rotate-180');
    }
  }

  // Category Checkboxes Handler
  onCategoryChange() {
    const catCheckboxes = document.querySelectorAll('input[name="filter-cat"]:checked');
    this.selectedCategories = Array.from(catCheckboxes).map(cb => cb.value);
    this.renderCatalog();
  }

  // Product Type / Preference Radios Handler
  onTypeChange(typeVal) {
    this.selectedType = typeVal;
    // Sync all product type radio buttons
    const radios = document.querySelectorAll('input[name="product-type-radio"]');
    radios.forEach(radio => {
      radio.checked = (radio.value === typeVal);
    });
    this.renderCatalog();
  }

  // Max Price Slider Handler
  onPriceInput(val) {
    this.currentMaxPrice = parseFloat(val);
    const priceValEls = document.querySelectorAll('.filter-price-val-display');
    priceValEls.forEach(el => {
      el.innerText = `$${this.currentMaxPrice}`;
    });
    const priceSliders = document.querySelectorAll('.filter-price-range-input');
    priceSliders.forEach(slider => {
      slider.value = this.currentMaxPrice;
    });
    this.renderCatalog();
  }

  // Brand Checkboxes Handler
  onBrandChange() {
    const brandCheckboxes = document.querySelectorAll('input[name="filter-brand"]:checked');
    this.selectedBrands = Array.from(brandCheckboxes).map(cb => cb.value);
    this.renderCatalog();
  }

  // Apply button inside Drawer
  applyDrawerFilters() {
    this.renderCatalog();
    this.closeFilterDrawer();
  }

  // Reset all filters
  resetFilters() {
    this.selectedCategories = [];
    this.selectedType = 'all';
    this.currentSearch = '';
    this.currentMaxPrice = 100;
    this.selectedBrands = [];
    this.currentSort = 'popular';

    // Reset Checkboxes
    const checkboxes = document.querySelectorAll('input[name="filter-cat"], input[name="filter-brand"]');
    checkboxes.forEach(cb => { cb.checked = false; });

    // Reset Radio
    const radios = document.querySelectorAll('input[name="product-type-radio"]');
    radios.forEach(radio => {
      radio.checked = (radio.value === 'all');
    });

    // Reset Price Sliders & Display Text
    const priceSliders = document.querySelectorAll('.filter-price-range-input');
    priceSliders.forEach(slider => { slider.value = 100; });

    const priceValEls = document.querySelectorAll('.filter-price-val-display');
    priceValEls.forEach(el => { el.innerText = '$100'; });

    // Reset Sort select
    const sortSelect = document.getElementById('shop-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    this.renderCatalog();
  }

  syncUIWithFilters() {
    // Check categories
    const catCheckboxes = document.querySelectorAll('input[name="filter-cat"]');
    catCheckboxes.forEach(cb => {
      cb.checked = this.selectedCategories.includes(cb.value);
    });

    // Check product type
    const radios = document.querySelectorAll('input[name="product-type-radio"]');
    radios.forEach(radio => {
      radio.checked = (radio.value === this.selectedType);
    });

    // Price sliders
    const priceSliders = document.querySelectorAll('.filter-price-range-input');
    priceSliders.forEach(slider => { slider.value = this.currentMaxPrice; });
    const priceValEls = document.querySelectorAll('.filter-price-val-display');
    priceValEls.forEach(el => { el.innerText = `$${this.currentMaxPrice}`; });

    // Check brands
    const brandCheckboxes = document.querySelectorAll('input[name="filter-brand"]');
    brandCheckboxes.forEach(cb => {
      cb.checked = this.selectedBrands.includes(cb.value);
    });
  }

  getFilteredProducts() {
    if (!window.productsData) return [];
    let list = [...window.productsData];

    // 1. Categories Filter (Supports multi-select or single URL param)
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      list = list.filter(p => {
        const pCatId = (p.categoryId || '').toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();

        return this.selectedCategories.some(catKey => {
          const targetCat = catKey.toLowerCase().trim();
          if (pCatId === targetCat || pCat === targetCat) return true;

          if (targetCat === 'fruits-veggies' || targetCat === 'fruits' || targetCat === 'vegetables') {
            return pCatId === 'fruits-veggies' || pCat.includes('fruit') || pCat.includes('vegetable');
          }
          if (targetCat === 'dairy-eggs' || targetCat === 'dairy' || targetCat === 'eggs') {
            return pCatId === 'dairy-eggs' || pCat.includes('dairy') || pCat.includes('egg');
          }
          if (targetCat === 'meat-seafood' || targetCat === 'meat' || targetCat === 'seafood') {
            return pCatId === 'meat-seafood' || pCat.includes('meat') || pCat.includes('seafood');
          }
          if (targetCat === 'bakery') {
            return pCatId === 'bakery' || pCat.includes('bakery') || pCat.includes('bread');
          }
          if (targetCat === 'pantry') {
            return pCatId === 'pantry' || pCat.includes('pantry') || pCat.includes('staple');
          }
          if (targetCat === 'beverages') {
            return pCatId === 'beverages' || pCat.includes('beverage') || pCat.includes('drink');
          }
          if (targetCat === 'snacks') {
            return pCatId === 'snacks' || pCat.includes('snack') || pCat.includes('sweet');
          }
          if (targetCat === 'frozen') {
            return pCatId === 'frozen' || pCat.includes('frozen');
          }

          return pCat.replace(/[^a-z0-9]/g, '-').includes(targetCat);
        });
      });
    }

    // 2. Product Type / Preference Filter (Prescription Type equivalent)
    if (this.selectedType && this.selectedType !== 'all') {
      const typeKey = this.selectedType.toLowerCase();
      list = list.filter(p => {
        const itemDiet = (p.dietary || []).map(d => d.toLowerCase());
        const itemTags = (p.tags || []).map(t => t.toLowerCase());
        const itemName = (p.name || '').toLowerCase();

        if (typeKey === 'organic') {
          return itemDiet.some(d => d.includes('organic')) || itemTags.some(t => t.includes('organic')) || itemName.includes('organic');
        }
        if (typeKey === 'deals') {
          return p.isWeeklyDeal || (p.discount && p.discount > 0);
        }
        if (typeKey === 'gluten-free') {
          return itemDiet.some(d => d.includes('gluten')) || itemTags.some(t => t.includes('gluten')) || itemName.includes('gluten');
        }
        if (typeKey === 'vegan') {
          return itemDiet.some(d => d.includes('vegan') || d.includes('plant')) || itemTags.some(t => t.includes('vegan')) || itemName.includes('vegan');
        }
        return true;
      });
    }

    // 3. Search query filter
    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(q) || 
        (p.brand || '').toLowerCase().includes(q) || 
        (p.category || '').toLowerCase().includes(q)
      );
    }

    // 4. Max price filter
    if (this.currentMaxPrice) {
      list = list.filter(p => p.price <= this.currentMaxPrice);
    }

    // 5. Brand filter
    if (this.selectedBrands && this.selectedBrands.length > 0) {
      list = list.filter(p => this.selectedBrands.includes(p.brand));
    }

    // 6. Sort order
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

  renderProductCard(p) {
    const isFav = window.wishlistManager ? window.wishlistManager.hasItem(p.id) : false;
    const safeName = (p.name || '').replace(/"/g, '&quot;');
    const hasImage = Boolean(p.image && p.image.trim());
    
    if (this.viewMode === 'list') {
      return `
        <div class="product-card product-card-list flex flex-row items-center p-3 sm:p-4 gap-3 sm:gap-5 cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 transition-all overflow-hidden" onclick="if(!event.target.closest('.add-to-cart-btn') && !event.target.closest('.wishlist-toggle-btn')) window.location.href='product.html?id=${p.id}'">
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
                  <span class="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">${p.category}</span>
                  ${!hasImage && p.discount ? `<span class="badge-discount text-[10px] sm:text-xs px-1.5 py-0.5">-${p.discount}% OFF</span>` : ''}
                  ${p.tags && p.tags.includes('Organic') ? '<span class="badge-organic text-[10px] sm:text-xs px-1.5 py-0.5">Organic</span>' : ''}
                </div>
                <button data-product-id="${p.id}" class="wishlist-toggle-btn w-8 h-8 sm:w-9 sm:h-9 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                  <i class="${isFav ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart text-slate-500 dark:text-slate-400'} text-xs sm:text-sm"></i>
                </button>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5 hover:text-emerald-600 transition-colors line-clamp-1">
                <a href="product.html?id=${p.id}">${p.name}</a>
              </h3>
              <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1.5">${p.weight} • ${p.brand}</p>
              ${p.description ? `<p class="text-xs text-slate-600 dark:text-slate-300 mb-2 line-clamp-1 hidden sm:block">${p.description}</p>` : ''}
            </div>
            <div class="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-auto min-w-0">
              <div class="flex items-baseline gap-1 min-w-0 flex-shrink">
                <span class="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">$${p.price.toFixed(2)}</span>
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
      <div class="product-card flex flex-col justify-between cursor-pointer bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 transition-all overflow-hidden ${hasImage ? '' : 'p-4 sm:p-5'}" onclick="if(!event.target.closest('.add-to-cart-btn') && !event.target.closest('.wishlist-toggle-btn')) window.location.href='product.html?id=${p.id}'">
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
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-1 line-clamp-2 hover:text-emerald-600 transition-colors">
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
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-1 line-clamp-2 hover:text-emerald-600 transition-colors">
              <a href="product.html?id=${p.id}">${p.name}</a>
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-3">${p.weight}</p>
          </div>
          `}
        </div>
        <div class="${hasImage ? 'p-3 sm:p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80' : 'pt-3 border-t border-slate-100 dark:border-slate-800/80'} mt-auto">
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-baseline gap-1">
              <span class="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">$${p.price.toFixed(2)}</span>
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

  renderCatalog() {
    const grid = document.getElementById('shop-product-grid');
    const countEl = document.getElementById('shop-product-count');
    if (!grid) return;

    const filtered = this.getFilteredProducts();
    
    // Update toolbar text strictly matching Image 2 ("Showing X items")
    if (countEl) {
      countEl.innerText = `Showing ${filtered.length} items`;
    }

    if (filtered.length === 0) {
      grid.className = 'w-full py-16 text-center';
      grid.innerHTML = `
        <div class="max-w-md mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No products match your filter</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Try adjusting your price range, selected categories, or product type filters.</p>
          <button onclick="productCatalog.resetFilters()" class="btn-secondary text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold rounded-xl transition-colors">Reset All Filters</button>
        </div>
      `;
      return;
    }

    grid.className = this.viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
      : 'flex flex-col gap-4';

    grid.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
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
        gridBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-green-600 text-white shadow-sm';
        listBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white';
        this.renderCatalog();
      });
      listBtn.addEventListener('click', () => {
        this.viewMode = 'list';
        listBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-green-600 text-white shadow-sm';
        gridBtn.className = 'w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white';
        this.renderCatalog();
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.productCatalog = new ProductCatalogController();
});
