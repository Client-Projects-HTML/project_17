/**
 * FreshBasket Master AdminLayout Helper
 * Shared helper utilities for the Admin Panel.
 */

class AdminLayout {
  static init() {
    this.bindMobileToggle();
  }

  static toggleSidebar() {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    if (sidebar.classList.contains('hidden')) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('flex', 'z-50', 'bg-white', 'dark:bg-slate-900');
    } else {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('z-50');
    }
  }

  static bindMobileToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#admin-mobile-toggle');
      if (btn) {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  AdminLayout.init();
});

window.AdminLayout = AdminLayout;

