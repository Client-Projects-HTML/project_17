/**
 * FreshBasket User Dashboard Controller
 * Manages user profile tabs, saved grocery shopping lists, order history & address book.
 */

class DashboardController {
  constructor() {
    this.savedListsKey = 'freshbasket_saved_lists';
    this.savedLists = this.loadSavedLists();
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderSavedLists();
  }

  loadSavedLists() {
    const saved = localStorage.getItem(this.savedListsKey);
    return saved ? JSON.parse(saved) : [
      {
        id: "list-1",
        name: "Weekly Essentials",
        updated: "2 days ago",
        itemIds: ["prod-1", "prod-6", "prod-7", "prod-14"],
        itemCount: 4
      },
      {
        id: "list-2",
        name: "Healthy Breakfast",
        updated: "1 week ago",
        itemIds: ["prod-2", "prod-8", "prod-21", "prod-39"],
        itemCount: 4
      }
    ];
  }

  saveSavedLists() {
    localStorage.setItem(this.savedListsKey, JSON.stringify(this.savedLists));
    this.renderSavedLists();
  }

  addAllToCart(listId) {
    const list = this.savedLists.find(l => l.id === listId);
    if (!list || !window.productsData || !window.cartManager) return;

    let addedCount = 0;
    list.itemIds.forEach(id => {
      const product = window.productsData.find(p => p.id === id);
      if (product) {
        window.cartManager.addItem(product, 1);
        addedCount++;
      }
    });

    if (window.showToast) {
      window.showToast(`Added ${addedCount} items from "${list.name}" to your cart!`, 'success');
    }
  }

  createNewList(name) {
    if (!name.trim()) return;
    const newList = {
      id: "list-" + Date.now(),
      name: name,
      updated: "Just now",
      itemIds: ["prod-1", "prod-5", "prod-17"],
      itemCount: 3
    };
    this.savedLists.push(newList);
    this.saveSavedLists();
    if (window.showToast) window.showToast(`Created grocery list "${name}"!`, 'success');
  }

  deleteList(listId) {
    this.savedLists = this.savedLists.filter(l => l.id !== listId);
    this.saveSavedLists();
    if (window.showToast) window.showToast('Shopping list deleted.', 'info');
  }

  renderSavedLists() {
    const container = document.getElementById('saved-lists-grid');
    if (!container || !window.productsData) return;

    if (this.savedLists.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p class="text-slate-500 dark:text-slate-400 mb-4">You have no saved recurring shopping lists.</p>
          <button onclick="dashboardController.promptCreateList()" class="btn-primary">Create First List</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.savedLists.map(list => {
      const items = window.productsData.filter(p => list.itemIds.includes(p.id));
      return `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-xl flex items-center justify-center font-bold">
                  <i class="fa-solid fa-list-check"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-base">${list.name}</h4>
                  <span class="text-xs text-slate-400">Updated ${list.updated}</span>
                </div>
              </div>
              <button onclick="dashboardController.deleteList('${list.id}')" class="text-slate-400 hover:text-red-500 text-sm p-1">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
            
            <div class="space-y-2 mb-6">
              ${items.slice(0, 3).map(i => `
                <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span class="font-medium truncate">${i.name}</span>
                  <span class="font-bold text-green-600">$${i.price.toFixed(2)}</span>
                </div>
              `).join('')}
              ${items.length > 3 ? `<p class="text-xs text-slate-400 text-center font-medium">+ ${items.length - 3} more items</p>` : ''}
            </div>
          </div>

          <button onclick="dashboardController.addAllToCart('${list.id}')" class="btn-primary w-full text-xs">
            <i class="fa-solid fa-cart-plus"></i> Add All To Cart
          </button>
        </div>
      `;
    }).join('');
  }

  promptCreateList() {
    const name = prompt("Enter a name for your new grocery list (e.g. Weekend BBQ, Daily Dairy):");
    if (name) this.createNewList(name);
  }

  bindEvents() {
    // Dashboard sidebar tab switcher
    const tabBtns = document.querySelectorAll('.dashboard-tab-btn');
    const tabContents = document.querySelectorAll('.dashboard-tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = btn.dataset.tab;
        if (!targetTab) return;

        tabBtns.forEach(b => {
          b.classList.remove('bg-green-600', 'text-white');
          b.classList.add('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
        });
        btn.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
        btn.classList.add('bg-green-600', 'text-white');

        tabContents.forEach(c => {
          c.style.display = c.id === `tab-content-${targetTab}` ? 'block' : 'none';
        });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboardController = new DashboardController();
});
