/**
 * FreshBasket Master AdminLayout Helper
 * Shared helper utilities for the Admin Panel layout.
 */

class AdminLayout {
  static init() {
    // Shared admin layout helpers
  }

  static toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar') || document.querySelector('aside');
    const overlay = document.getElementById('admin-sidebar-overlay');
    if (!sidebar) return;

    if (sidebar.classList.contains('translate-x-full') || sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.remove('translate-x-full', '-translate-x-full');
      sidebar.classList.add('translate-x-0');
      if (overlay) overlay.classList.remove('hidden');
    } else {
      sidebar.classList.add('translate-x-full');
      sidebar.classList.remove('translate-x-0');
      if (overlay) overlay.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  AdminLayout.init();
});

window.AdminLayout = AdminLayout;

