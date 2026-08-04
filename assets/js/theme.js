/**
 * FreshBasket Theme & RTL Controller
 * Manages dark/light mode preference and RTL layout state with localStorage persistence.
 */

class ThemeController {
  constructor() {
    this.themeKey = 'freshbasket_theme';
    this.rtlKey = 'freshbasket_rtl';
    this.init();
  }

  init() {
    // Check theme preference
    const savedTheme = localStorage.getItem(this.themeKey);
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }

    // Check RTL preference
    const savedRTL = localStorage.getItem(this.rtlKey);
    if (savedRTL === 'true') {
      this.enableRTL();
    } else {
      this.disableRTL();
    }

    this.bindEvents();
  }

  enableDarkMode() {
    document.documentElement.classList.add('dark');
    localStorage.setItem(this.themeKey, 'dark');
    this.updateThemeIcons(true);
  }

  disableDarkMode() {
    document.documentElement.classList.remove('dark');
    localStorage.setItem(this.themeKey, 'light');
    this.updateThemeIcons(false);
  }

  toggleDarkMode() {
    document.documentElement.classList.add('theme-transitioning');
    if (document.documentElement.classList.contains('dark')) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);
  }

  enableRTL() {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
    localStorage.setItem(this.rtlKey, 'true');
    this.updateRTLBtns(true);
  }

  disableRTL() {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.setAttribute('lang', 'en');
    localStorage.setItem(this.rtlKey, 'false');
    this.updateRTLBtns(false);
  }

  toggleRTL() {
    document.documentElement.classList.add('theme-transitioning');
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    if (isRTL) {
      this.disableRTL();
    } else {
      this.enableRTL();
    }
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 300);
  }

  updateThemeIcons(isDark) {
    const themeToggles = document.querySelectorAll('.theme-toggle-btn');
    themeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (isDark) {
          icon.className = 'fa-solid fa-sun text-amber-400';
          btn.setAttribute('aria-label', 'Switch to Light Mode');
        } else {
          icon.className = 'fa-solid fa-moon text-slate-600';
          btn.setAttribute('aria-label', 'Switch to Dark Mode');
        }
      }
    });
  }

  updateRTLBtns(isRTL) {
    const rtlBtns = document.querySelectorAll('.rtl-toggle-btn');
    rtlBtns.forEach(btn => {
      btn.setAttribute('title', isRTL ? 'Switch to LTR Mode' : 'Switch to RTL Mode');
      btn.setAttribute('aria-label', isRTL ? 'Switch to LTR Mode' : 'Switch to RTL Mode');
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      const themeBtn = e.target.closest('.theme-toggle-btn');
      if (themeBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.toggleDarkMode();
        return;
      }
      const rtlBtn = e.target.closest('.rtl-toggle-btn');
      if (rtlBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.toggleRTL();
        return;
      }
    }, true);
  }
}

// Global Theme Instance
window.themeController = new ThemeController();
