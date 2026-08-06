/**
 * FreshBasket Master Application Initializer
 * Coordinates global UI components: header search autocomplete, zip code delivery checker, mobile drawers, modals, toast alerts.
 */

// Global Toast Notification Engine
window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';

  let iconClass = 'fa-solid fa-circle-check text-green-500';
  if (type === 'danger') iconClass = 'fa-solid fa-circle-exclamation text-red-500';
  if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation text-amber-500';
  if (type === 'info') iconClass = 'fa-solid fa-circle-info text-blue-500';

  toast.innerHTML = `
    <i class="${iconClass} text-xl flex-shrink-0"></i>
    <div class="flex-1 text-sm font-medium text-slate-800 dark:text-white">${message}</div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 text-sm ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Global Mobile Menu Toggle Helper
window.toggleMobileMenu = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
  }
  const drawer = document.getElementById('mobile-menu-drawer');
  const overlay = document.getElementById('mobile-menu-overlay');
  if (drawer && overlay) {
    const isClosed = drawer.classList.contains('translate-x-full');
    if (isClosed) {
      drawer.classList.remove('translate-x-full', '-translate-x-full');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-full');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
  return false;
};

window.logoutUser = function() {
  localStorage.setItem('freshbasket_logged_in', 'false');
  localStorage.setItem('freshbasket_admin_logged_in', 'false');
  const redirectPath = window.location.pathname.includes('/pages/') ? 'login.html' : (window.location.pathname.includes('/admin/') ? '../pages/login.html' : 'pages/login.html');
  window.location.href = redirectPath;
};

window.logoutAdmin = function() {
  localStorage.setItem('freshbasket_admin_logged_in', 'false');
  localStorage.setItem('freshbasket_logged_in', 'false');
  const redirectPath = window.location.pathname.includes('/admin/') ? '../pages/login.html' : (window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
  window.location.href = redirectPath;
};

// Application Main Setup
class AppMain {
  constructor() {
    this.init();
  }

  init() {
    this.setupStickyHeader();
    this.setupHomeDropdown();
    this.setupAccountDropdown();
    this.setupLoginDropdown();
    this.setupMobileMenu();
    this.setupCartDrawer();
    this.setupSearchAutocomplete();
    this.setupZipChecker();
    this.setupLocationModal();
    this.setupMobileTouchFeedback();
    this.setupDeliveryMap();
  }

  setupLoginDropdown() {
    // Login dropdown removed - direct link to login page
  }

  setupAccountDropdown() {
    document.querySelectorAll('.account-dropdown-wrapper').forEach(wrapper => {
      const trigger = wrapper.querySelector('button');
      const menu = wrapper.querySelector('div');
      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          menu.classList.toggle('hidden');
        });
      }
    });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#mobile-account-dropdown-trigger');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const mobileMenu = document.getElementById('mobile-account-dropdown-menu');
        const mobileChevron = document.getElementById('mobile-account-chevron');
        if (mobileMenu) {
          mobileMenu.classList.toggle('hidden');
        }
        if (mobileChevron) {
          mobileChevron.classList.toggle('rotate-180');
        }
      }
    });
  }

  setupStickyHeader() {
    if (window.location.pathname.includes('/admin/') || document.querySelector('aside#admin-sidebar') || document.querySelector('aside.fixed')) return;

    const header = document.querySelector('header');
    if (!header) return;

    // Enforce true fixed top navbar positioning
    header.classList.add('fixed', 'top-0', 'left-0', 'right-0', 'z-50', 'w-full', 'transition-all', 'duration-300');
    header.classList.remove('sticky');

    // Automatically pad document body so layout content is never clipped under fixed header
    const updateBodyPadding = () => {
      const headerHeight = header.offsetHeight || 116;
      document.body.style.paddingTop = `${headerHeight}px`;
    };

    updateBodyPadding();
    window.addEventListener('resize', updateBodyPadding);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('shadow-md', 'backdrop-blur-md');
        header.classList.remove('shadow-sm');
      } else {
        header.classList.remove('shadow-md', 'backdrop-blur-md');
        header.classList.add('shadow-sm');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  setupHomeDropdown() {
    // Desktop Homepages Dropdown
    const trigger = document.getElementById('home-dropdown-trigger');
    const menu = document.getElementById('home-dropdown-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add('hidden');
        }
      });
    }

    // Mobile Navigation Drawer Home Dropdown Accordion (Event Delegation)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#mobile-home-dropdown-trigger');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const mobileMenu = document.getElementById('mobile-home-dropdown-menu');
        const mobileChevron = document.getElementById('mobile-home-chevron');
        if (mobileMenu) {
          mobileMenu.classList.toggle('hidden');
        }
        if (mobileChevron) {
          mobileChevron.classList.toggle('rotate-180');
        }
      }
    });
  }



  setupMobileTouchFeedback() {
    // Enable active tap feedback state on mobile touch devices
    document.addEventListener('touchstart', (e) => {
      const card = e.target.closest('.touch-card, .product-card, .category-card, .btn-primary, .btn-secondary');
      if (card) {
        card.classList.add('tap-active');
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const card = e.target.closest('.touch-card, .product-card, .category-card, .btn-primary, .btn-secondary');
      if (card) {
        setTimeout(() => card.classList.remove('tap-active'), 150);
      }
    }, { passive: true });
  }

  setupMobileMenu() {
    const closeMenu = () => {
      const drawer = document.getElementById('mobile-menu-drawer');
      const overlay = document.getElementById('mobile-menu-overlay');
      if (drawer && overlay) {
        drawer.classList.remove('-translate-x-full');
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#mobile-menu-toggle');
      if (toggleBtn) {
        // Handled directly by inline onclick or window.toggleMobileMenu
        return;
      } else if (e.target.closest('#mobile-menu-close') || e.target.closest('#mobile-menu-overlay')) {
        e.preventDefault();
        closeMenu();
      } else if (e.target.closest('#mobile-menu-drawer a:not([id$="-dropdown-trigger"])')) {
        closeMenu();
      }
    });
  }

  setupCartDrawer() {
    const openCart = () => {
      const drawer = document.getElementById('cart-drawer');
      const overlay = document.getElementById('cart-drawer-overlay');
      if (drawer && overlay) {
        drawer.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        if (window.cartManager) {
          window.cartManager.renderCartDrawer();
        }
      }
    };
    const closeCart = () => {
      const drawer = document.getElementById('cart-drawer');
      const overlay = document.getElementById('cart-drawer-overlay');
      if (drawer && overlay) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('hidden');
      }
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('.rtl-toggle-btn') || e.target.closest('.theme-toggle-btn')) {
        return;
      }

      if (e.target.closest('.cart-drawer-trigger')) {
        e.preventDefault();
        openCart();
        return;
      }

      if (e.target.closest('#cart-drawer-close') || e.target.closest('#cart-drawer-overlay')) {
        e.preventDefault();
        closeCart();
        return;
      }
    });
  }

  setupSearchAutocomplete() {
    const searchInputs = document.querySelectorAll('.header-search-input');
    searchInputs.forEach(input => {
      const container = input.parentElement;
      let dropdown = container.querySelector('.search-autocomplete-dropdown');

      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-autocomplete-dropdown hidden absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden';
        container.appendChild(dropdown);
      }

      input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2 || !window.productsData) {
          dropdown.classList.add('hidden');
          return;
        }

        const matches = window.productsData.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
        ).slice(0, 5);

        if (matches.length === 0) {
          dropdown.innerHTML = `
            <div class="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No groceries found for "<span class="font-semibold">${query}</span>"
            </div>
          `;
        } else {
          dropdown.innerHTML = matches.map(p => `
            <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}product.html?id=${p.id}" class="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-none">
              <img src="${p.image}" alt="${p.name}" class="w-10 h-10 object-cover rounded-lg" />
              <div class="flex-1 min-w-0">
                <div class="font-bold text-sm text-slate-900 dark:text-white truncate">${p.name}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">${p.category} • ${p.weight}</div>
              </div>
              <span class="font-extrabold text-sm text-green-600 dark:text-green-400">$${p.price.toFixed(2)}</span>
            </a>
          `).join('');
        }

        dropdown.classList.remove('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
    });
  }

  setupZipChecker() {
    const form = document.getElementById('zip-checker-form');
    const resultBox = document.getElementById('zip-checker-result');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const zipInput = document.getElementById('zip-input');
        if (!zipInput || !zipInput.value) return;

        const zip = zipInput.value.trim();
        if (resultBox) {
          resultBox.innerHTML = `
            <div class="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <div>
                <h5 class="font-bold text-green-900 dark:text-green-200 text-sm">Delivery Available to ZIP ${zip}!</h5>
                <p class="text-xs text-green-700 dark:text-green-300">Estimated delivery: 25-35 mins • Free delivery on orders over $50</p>
              </div>
            </div>
          `;
          resultBox.classList.remove('hidden');
        }

        // Trigger interactive map update if map exists
        if (window.updateDeliveryMapZip) {
          window.updateDeliveryMapZip(zip);
        }
      });
    }
  }

  setupDeliveryMap() {
    const mapContainer = document.getElementById('delivery-map');
    if (!mapContainer) return;

    const initMap = () => {
      if (typeof L === 'undefined') {
        setTimeout(initMap, 150);
        return;
      }

      // Store Center Location: Midtown Manhattan, NY
      const storeLocation = [40.7580, -73.9855];
      
      const map = L.map('delivery-map', {
        center: storeLocation,
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB tile layers for dark and light modes
      const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      });

      const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      });

      let currentTileLayer = null;
      const updateTiles = () => {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
          if (currentTileLayer && map.hasLayer(currentTileLayer)) map.removeLayer(currentTileLayer);
          darkTiles.addTo(map);
          currentTileLayer = darkTiles;
        } else {
          if (currentTileLayer && map.hasLayer(currentTileLayer)) map.removeLayer(currentTileLayer);
          lightTiles.addTo(map);
          currentTileLayer = lightTiles;
        }
      };

      updateTiles();

      // Theme toggle observer
      const observer = new MutationObserver(() => updateTiles());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      // 5-Mile Delivery Circle (~8046m)
      const deliveryCircle = L.circle(storeLocation, {
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: 0.15,
        weight: 2.5,
        dashArray: '6, 6'
      }).addTo(map);

      // Central Store Hub Pin
      const storeIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="map-marker-hub" title="FreshBasket Store Hub"><i class="fa-solid fa-basket-shopping"></i></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const storeMarker = L.marker(storeLocation, { icon: storeIcon }).addTo(map);
      storeMarker.bindPopup(`
        <div class="p-2 text-center min-w-[170px]">
          <div class="inline-block bg-green-500/20 text-green-600 dark:text-green-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full mb-1">MAIN DISPATCH HUB</div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white">FreshBasket Hub #01</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">100% Express Grocery Inventory</p>
          <div class="text-[11px] text-green-600 dark:text-green-400 font-semibold mt-1 flex items-center justify-center gap-1"><i class="fa-solid fa-bolt text-amber-500"></i> 15-30 Min Delivery Zone</div>
        </div>
      `);

      // Active Live Shoppers Pins
      const shoppers = [
        { name: "Marcus V.", lat: 40.7660, lng: -73.9780, icon: "fa-motorcycle", task: "Delivering Order #FB-8921", time: "5 mins away" },
        { name: "Elena R.", lat: 40.7480, lng: -73.9920, icon: "fa-bicycle", task: "Picking fresh produce", time: "In Store" },
        { name: "David K.", lat: 40.7520, lng: -73.9690, icon: "fa-truck-fast", task: "Express Slot Dispatch", time: "12 mins away" }
      ];

      shoppers.forEach(s => {
        const sIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="map-marker-shopper" title="${s.name}"><i class="fa-solid ${s.icon}"></i></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        const sMarker = L.marker([s.lat, s.lng], { icon: sIcon }).addTo(map);
        sMarker.bindPopup(`
          <div class="p-2 min-w-[150px]">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <span class="font-bold text-xs text-slate-900 dark:text-white">${s.name}</span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${s.task}</div>
            <div class="text-[11px] text-green-600 dark:text-green-400 font-medium mt-1"><i class="fa-regular fa-clock"></i> ${s.time}</div>
          </div>
        `);
      });

      // Recenter button binding
      const recenterBtn = document.getElementById('recenter-map-btn');
      if (recenterBtn) {
        recenterBtn.addEventListener('click', () => {
          map.flyToBounds(deliveryCircle.getBounds(), { padding: [25, 25], duration: 1.2 });
        });
      }

      // Live Zip Code search map interaction
      let userMarker = null;
      window.updateDeliveryMapZip = (zip) => {
        const zipHash = zip.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const latOffset = ((zipHash % 30) - 15) * 0.0012;
        const lngOffset = (((zipHash * 5) % 30) - 15) * 0.0012;

        const targetLat = storeLocation[0] + latOffset;
        const targetLng = storeLocation[1] + lngOffset;

        if (userMarker) {
          map.removeLayer(userMarker);
        }

        const uIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="map-marker-user"><i class="fa-solid fa-location-dot"></i></div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        userMarker = L.marker([targetLat, targetLng], { icon: uIcon }).addTo(map);
        userMarker.bindPopup(`
          <div class="p-2 text-center min-w-[160px]">
            <div class="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center gap-1">
              <i class="fa-solid fa-circle-check"></i> ZIP ${zip} Covered!
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Within Active 5-Mile Zone</p>
            <div class="text-[11px] font-bold text-green-600 dark:text-green-400 mt-1">Express Delivery Available</div>
          </div>
        `).openPopup();

        map.flyTo([targetLat, targetLng], 14, { duration: 1.2 });

        const statusText = document.getElementById('map-status-text');
        if (statusText) {
          statusText.innerHTML = `ZIP <strong class="text-green-600 dark:text-green-400">${zip}</strong> is inside our 5-Mile Express Delivery Zone!`;
        }
      };
    };

    initMap();
  }

  setupLocationModal() {
    const openBtns = document.querySelectorAll('.location-modal-trigger');
    const modal = document.getElementById('location-modal');
    const closeBtn = document.getElementById('location-modal-close');
    const saveBtn = document.getElementById('location-modal-save');
    const currentLocText = document.querySelectorAll('.current-location-text');

    if (openBtns && modal) {
      openBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('hidden')));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (saveBtn && modal) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('location-modal-input');
        if (input && input.value) {
          currentLocText.forEach(t => t.innerText = input.value);
          if (window.showToast) window.showToast(`Delivery location set to: ${input.value}`, 'success');
        }
        modal.classList.add('hidden');
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appMain = new AppMain();
});
