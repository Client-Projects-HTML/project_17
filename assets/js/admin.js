/**
 * FreshBasket Admin Dashboard Controller
 * Handles administrative table filtering, product CRUD modal simulation, order status modifiers, and CSS/JS charts.
 */

class AdminController {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.initAdminCharts();
  }

  initAdminCharts() {
    // Render simple visual CSS bar chart if containers exist
    const salesChart = document.getElementById('admin-sales-chart');
    if (salesChart) {
      const data = [
        { day: 'Mon', sales: 1250 },
        { day: 'Tue', sales: 1890 },
        { day: 'Wed', sales: 1620 },
        { day: 'Thu', sales: 2100 },
        { day: 'Fri', sales: 2850 },
        { day: 'Sat', sales: 3400 },
        { day: 'Sun', sales: 2950 }
      ];
      const maxSales = Math.max(...data.map(d => d.sales));

      salesChart.innerHTML = `
        <div class="flex items-end justify-between h-48 pt-6 px-2 gap-2">
          ${data.map(d => {
            const heightPercent = (d.sales / maxSales) * 100;
            return `
              <div class="flex-1 flex flex-col items-center gap-2 group">
                <div class="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">$${d.sales}</div>
                <div class="w-full bg-green-100 dark:bg-green-950/40 rounded-t-md relative overflow-hidden flex items-end" style="height: 140px;">
                  <div class="w-full bg-green-600 rounded-t-md transition-all duration-500 group-hover:bg-green-500" style="height: ${heightPercent}%;"></div>
                </div>
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">${d.day}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  toggleOrderStatus(selectEl, orderId) {
    const newStatus = selectEl.value;
    if (window.showToast) {
      window.showToast(`Order #${orderId} status updated to: ${newStatus}`, 'success');
    }
  }

  deleteProductRow(btn) {
    if (confirm("Are you sure you want to remove this product from inventory?")) {
      const row = btn.closest('tr');
      if (row) row.remove();
      if (window.showToast) window.showToast('Product deleted from inventory.', 'info');
    }
  }

  bindEvents() {
    // Admin product modal trigger
    const addProdBtn = document.getElementById('admin-add-product-btn');
    const modal = document.getElementById('admin-product-modal');
    const modalClose = document.getElementById('admin-modal-close');

    if (addProdBtn && modal) {
      addProdBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    // Mobile sidebar toggle handler
    this.setupMobileSidebar();
  }

  setupMobileSidebar() {
    const sidebar = document.getElementById('admin-sidebar') || document.querySelector('aside');
    let overlay = document.getElementById('admin-sidebar-overlay');

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'admin-sidebar-overlay';
      overlay.className = 'hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden transition-opacity';
      document.body.appendChild(overlay);
    }

    const openSidebar = () => {
      if (sidebar && overlay) {
        sidebar.classList.remove('translate-x-full', '-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
      }
    };

    const closeSidebar = () => {
      if (sidebar && overlay) {
        sidebar.classList.add('translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('hidden');
      }
    };

    document.addEventListener('click', (e) => {
      if (e.target.closest('#admin-mobile-toggle')) {
        e.preventDefault();
        if (sidebar && sidebar.classList.contains('translate-x-0')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      } else if (e.target.closest('#admin-sidebar-overlay')) {
        e.preventDefault();
        closeSidebar();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminController = new AdminController();
});
