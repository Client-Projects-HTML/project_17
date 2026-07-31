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
    this.setupMobileMenu();
    this.setupCartDrawer();
    this.setupSearchAutocomplete();
    this.setupZipChecker();
    this.setupLocationModal();
    this.setupMobileTouchFeedback();
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

    const mobileTrigger = document.getElementById('mobile-account-dropdown-trigger');
    const mobileMenu = document.getElementById('mobile-account-dropdown-menu');

    if (mobileTrigger && mobileMenu) {
      mobileTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        mobileMenu.classList.toggle('hidden');
      });
    }
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

    // Mobile Navigation Drawer Home Dropdown Accordion
    const mobileTrigger = document.getElementById('mobile-home-dropdown-trigger');
    const mobileMenu = document.getElementById('mobile-home-dropdown-menu');
    const mobileChevron = document.getElementById('mobile-home-chevron');

    if (mobileTrigger && mobileMenu) {
      mobileTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        if (mobileChevron) {
          mobileChevron.classList.toggle('rotate-180');
        }
      });
    }
  }

  setupLoginDropdown() {
    // Desktop Login Dropdown
    document.querySelectorAll('.login-dropdown-wrapper').forEach(wrapper => {
      const trigger = wrapper.querySelector('#login-dropdown-trigger, .login-dropdown-trigger');
      const menu = wrapper.querySelector('#login-dropdown-menu, .login-dropdown-menu');

      if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          menu.classList.toggle('hidden');
        });

        wrapper.addEventListener('mouseenter', () => {
          menu.classList.remove('hidden');
        });
        wrapper.addEventListener('mouseleave', () => {
          menu.classList.add('hidden');
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.login-dropdown-wrapper')) {
        document.querySelectorAll('.login-dropdown-menu').forEach(m => m.classList.add('hidden'));
      }
    });

    // Mobile Navigation Drawer Login Accordion
    const mobileTrigger = document.getElementById('mobile-login-dropdown-trigger');
    const mobileMenu = document.getElementById('mobile-login-dropdown-menu');
    const mobileChevron = document.getElementById('mobile-login-chevron');

    if (mobileTrigger && mobileMenu) {
      mobileTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        if (mobileChevron) {
          mobileChevron.classList.toggle('rotate-180');
        }
      });
    }
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
    const openMenu = () => {
      const drawer = document.getElementById('mobile-menu-drawer');
      const overlay = document.getElementById('mobile-menu-overlay');
      if (drawer && overlay) {
        drawer.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
      }
    };
    const closeMenu = () => {
      const drawer = document.getElementById('mobile-menu-drawer');
      const overlay = document.getElementById('mobile-menu-overlay');
      if (drawer && overlay) {
        drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      }
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('#mobile-menu-toggle')) {
        e.preventDefault();
        openMenu();
      } else if (e.target.closest('#mobile-menu-close') || e.target.closest('#mobile-menu-overlay')) {
        e.preventDefault();
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
              <div class="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                <i class="fa-solid fa-truck-fast"></i>
              </div>
              <div>
                <h5 class="font-bold text-green-900 dark:text-green-200 text-sm">Delivery Available to ZIP ${zip}!</h5>
                <p class="text-xs text-green-700 dark:text-green-300">Estimated delivery: 30-45 mins • Free delivery on orders over $50</p>
              </div>
            </div>
          `;
          resultBox.classList.remove('hidden');
        }
      });
    }
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
