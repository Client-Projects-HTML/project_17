/**
 * FreshBasket Multi-Step Checkout Controller
 * Step 1: Delivery Address | Step 2: Delivery Slot | Step 3: Payment | Step 4: Order Review
 */

class CheckoutController {
  constructor() {
    this.currentStep = 1;
    this.selectedAddress = 'home';
    this.selectedSlot = 'asap';
    this.selectedPayment = 'card';
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateStepUI();
  }

  setStep(step) {
    if (step < 1 || step > 4) return;
    this.currentStep = step;
    this.updateStepUI();
  }

  updateStepUI() {
    // Step indicators
    for (let i = 1; i <= 4; i++) {
      const stepBadge = document.getElementById(`checkout-step-badge-${i}`);
      const stepContent = document.getElementById(`checkout-step-content-${i}`);
      
      if (stepBadge) {
        if (i < this.currentStep) {
          stepBadge.className = 'w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm';
          stepBadge.innerHTML = '<i class="fa-solid fa-check text-xs"></i>';
        } else if (i === this.currentStep) {
          stepBadge.className = 'w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm ring-4 ring-green-100 dark:ring-green-900/40';
          stepBadge.innerText = i;
        } else {
          stepBadge.className = 'w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm';
          stepBadge.innerText = i;
        }
      }

      if (stepContent) {
        stepContent.style.display = i === this.currentStep ? 'block' : 'none';
      }
    }
  }

  placeOrder() {
    if (!window.cartManager || window.cartManager.items.length === 0) {
      if (window.showToast) window.showToast('Your cart is empty!', 'danger');
      return;
    }

    const orderId = 'FB-' + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      orderId: orderId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...window.cartManager.items],
      subtotal: window.cartManager.getSubtotal(),
      shipping: window.cartManager.getShippingFee(),
      tax: window.cartManager.getTaxAmount(),
      total: window.cartManager.getTotal(),
      slot: this.selectedSlot,
      address: this.selectedAddress,
      payment: this.selectedPayment,
      status: 'Order Placed'
    };

    localStorage.setItem('freshbasket_last_order', JSON.stringify(orderData));
    window.cartManager.clearCart();
    window.location.href = 'order-confirmation.html';
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      // Step Nav buttons
      if (e.target.closest('#btn-to-step-2')) this.setStep(2);
      if (e.target.closest('#btn-to-step-3')) this.setStep(3);
      if (e.target.closest('#btn-to-step-4')) this.setStep(4);
      if (e.target.closest('#btn-back-step-1')) this.setStep(1);
      if (e.target.closest('#btn-back-step-2')) this.setStep(2);
      if (e.target.closest('#btn-back-step-3')) this.setStep(3);

      // Final order submission
      if (e.target.closest('#btn-place-order')) {
        this.placeOrder();
      }
    });

    // Slot options selection
    const slotOptions = document.querySelectorAll('.slot-option-card');
    slotOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        slotOptions.forEach(o => o.classList.remove('border-green-600', 'bg-green-50/50', 'dark:bg-green-950/20'));
        opt.classList.add('border-green-600', 'bg-green-50/50', 'dark:bg-green-950/20');
        this.selectedSlot = opt.dataset.slot;
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkout-step-content-1')) {
    window.checkoutController = new CheckoutController();
  }
});
