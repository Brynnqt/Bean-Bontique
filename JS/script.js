document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const cartIcon = document.querySelector(".cart-icon");
  const cart = document.querySelector(".cart");
  const cartContent = document.querySelector(".cart-content");
  const cartItemCountBadge = document.querySelector(".cart-count");
  const buyNowButton = document.querySelector(".btn-buy");
  const clearButton = document.querySelector(".btn-clear");

  const STORAGE_KEY = "cartItems";

  // ---------- Storage helpers ----------
  const getStoredCart = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      console.warn("Corrupted cart in storage. Resetting.");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  };

  const setStoredCart = (items) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCartCount();
  };

  // ---------- UI helpers ----------
  const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;

  const updateCartCount = () => {
    const items = getStoredCart();
    const count = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    if (!cartItemCountBadge) return;

    if (count > 0) {
      cartItemCountBadge.style.visibility = "visible";
      cartItemCountBadge.textContent = String(count);
    } else {
      cartItemCountBadge.style.visibility = "hidden";
      cartItemCountBadge.textContent = "";
    }
  };

  const createCartBox = (item) => {
    const div = document.createElement("div");
    div.className = "cart-box";
    // Use title as key; in real-world, use product id/sku
    div.dataset.title = item.title;
    div.innerHTML = `
      <img src="${item.img || ''}" class="cart-img" alt="">
      <div class="cart-detail">
        <h3 class="cart-product-title">${item.title}</h3>
        <span class="cart-price">${formatCurrency(item.price)}</span>
        <div class="cart-quantity">
          <button class="quantity-btn minus-btn" aria-label="decrease">-</button>
          <span class="number">${item.qty}</span>
          <button class="quantity-btn plus-btn" aria-label="increase">+</button>
          <i class="fa-solid fa-trash cart-delete-btn" title="Remove"></i>
        </div>
      </div>
      
    `;
    return div;
  };

  const renderCart = () => {
    if (!cartContent) return;
    const items = getStoredCart();
    cartContent.innerHTML = ""; // Reset current markup (including any static example row)

    if (!items.length) {
      cartContent.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-basket-shopping"></i>
          <h3>Your cart is empty</h3>
          <p>Browse our coffee selection and add items to your cart.</p>
          <a href="coffee_section.html" class="btn-continue">Continue Shopping</a>
        </div>`;
      updateTotalPrice();
      return;
    }

    items.forEach((item) => cartContent.appendChild(createCartBox(item)));
    updateTotalPrice();
  };

  const updateTotalPrice = () => {
    const subtotalElement = document.querySelector(".Sub-total-price");
    const taxElement = document.querySelector(".tax-price");
    const totalPriceElement = document.querySelector(".total-price");
    if (!subtotalElement && !taxElement && !totalPriceElement) return;

    const items = getStoredCart();
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (taxElement) taxElement.textContent = formatCurrency(tax);
    if (totalPriceElement) totalPriceElement.textContent = formatCurrency(total);
  };

  // ---------- Add to cart from product cards ----------
  const addToCart = (productBox) => {
    const productImg = productBox.querySelector("img");
    const productTitleElement = productBox.querySelector("h3");
    const productPriceElement = productBox.querySelector(".price, .deal-price");
    if (!productTitleElement || !productPriceElement) return;

    const productImgSrc = productImg ? productImg.src : "";
    const productTitle = productTitleElement.textContent.trim();
    const productPriceText = productPriceElement.textContent.trim();

    // Extract numeric price safely
    let priceText = productPriceText;
    if (priceText.toLowerCase().includes("new price:")) {
      priceText = priceText.split(":").pop().trim();
    }
    const productPrice = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;

    let items = getStoredCart();
    const existing = items.find((it) => it.title === productTitle);
    if (existing) {
      existing.qty = Math.min(10, Number(existing.qty || 0) + 1);
    } else {
      items.push({ title: productTitle, img: productImgSrc, price: productPrice, qty: 1 });
    }

    setStoredCart(items);

    // If we're on the cart page, re-render the list
    if (cartContent) renderCart();

    showAddToCartModal(productTitle);
    updateTotalPrice();
  };

  // Bind add to cart buttons
  const addCartButtons = document.querySelectorAll(".btn, .add-to-cart, .grab-deal-btn");
  addCartButtons.forEach((button) => {
    const container = button.closest(".product-card, .flash-deal");
    if (!container) return;
    button.addEventListener("click", (e) => {
      e.preventDefault();
      addToCart(container);
    });
  });

  // ---------- Cart interactions via event delegation ----------
  if (cartContent) {
    cartContent.addEventListener("click", (e) => {
      const target = e.target;
      const cartBox = target.closest(".cart-box");
      if (!cartBox) return;

      const title = cartBox.dataset.title || cartBox.querySelector(".cart-product-title")?.textContent?.trim();
      if (!title) return;

      let items = getStoredCart();
      const idx = items.findIndex((it) => it.title === title);
      if (idx === -1) return;

      if (target.matches(".minus-btn, #minus")) {
        items[idx].qty = Math.max(1, Number(items[idx].qty || 0) - 1);
        setStoredCart(items);
        renderCart();
      }

      if (target.matches(".plus-btn, #plus")) {
        items[idx].qty = Math.min(10, Number(items[idx].qty || 0) + 1);
        setStoredCart(items);
        renderCart();
      }

      if (target.matches(".cart-delete-btn, #delete")) {
        items.splice(idx, 1);
        setStoredCart(items);
        renderCart();
      }
    });
  }

  // ---------- Modals ----------
  const showAddToCartModal = (productTitle) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 9999;`;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background-color: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;
      box-shadow: 0 0 20px rgba(0,0,0,0.3); text-align: center;`;

    const checkmark = document.createElement("div");
    checkmark.textContent = "✓";
    checkmark.style.cssText = `font-size: 48px; color: #28a745; margin-bottom: 15px;`;

    const heading = document.createElement("h2");
    heading.textContent = `"${productTitle}" added to cart!`;
    heading.style.cssText = `margin-bottom: 10px; font-size: 20px;`;

    const subtext = document.createElement("p");
    subtext.textContent = "";
    subtext.style.cssText = `margin-bottom: 20px; font-size: 14px; color: #555;`;

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.cssText = `padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;`;
    okButton.addEventListener("click", () => overlay.remove());

    modal.appendChild(checkmark);
    modal.appendChild(heading);
    modal.appendChild(subtext);
    modal.appendChild(okButton);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.remove(), 3000);
  };

  // ---------- Alert/Alarm box (styled modal) ----------
  const showAlertBox = ({ title = "Notice", message = "", type = "info" } = {}) => {
    const colors = {
      info: { icon: "fa-circle-info", color: "#0d6efd" },
      success: { icon: "fa-circle-check", color: "#28a745" },
      warning: { icon: "fa-triangle-exclamation", color: "#ff9800" },
      error: { icon: "fa-circle-exclamation", color: "#dc3545" },
    };
    const theme = colors[type] || colors.info;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center; z-index: 10050;`;

    const box = document.createElement("div");
    box.style.cssText = `
      background: #fff; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,.25);
      width: min(420px, 92%); padding: 26px 22px; position: relative; text-align: center;`;

    box.innerHTML = `
      <div style="margin-bottom: 14px;">
        <i class="fa-solid ${theme.icon}" style="font-size: 2.6rem; color: ${theme.color};"></i>
      </div>
      <h3 style="margin: 0 0 8px 0; color: #2e2e2e; font-size: 1.3rem;">${title}</h3>
      <p style="margin: 0 0 18px 0; color: #666; line-height: 1.5;">${message}</p>
      <button id="alert-ok" style="padding: 10px 18px; border: none; background: ${theme.color}; color: #fff; border-radius: 8px; cursor: pointer; font-weight: 600;">OK</button>
      <button id="alert-close" aria-label="Close" style="position:absolute;top:10px;right:10px;background:none;border:none;color:#999;font-size:1.2rem;cursor:pointer">
        <i class="fa-solid fa-times"></i>
      </button>`;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    box.querySelector('#alert-ok').addEventListener('click', close);
    box.querySelector('#alert-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  };

  // ---------- Checkout Flow (reCAPTCHA + payment) ----------
  const showRecaptchaVerification = () => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center; z-index: 10000;`;

    const popup = document.createElement("div");
    popup.style.cssText = `
      background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 400px; width: 90%; text-align: center; position: relative;`;

    popup.innerHTML = `
      <div style="margin-bottom: 25px;">
        <i class="fa-solid fa-shield-halved" style="font-size: 2.5rem; color: #4b2e0e; margin-bottom: 15px;"></i>
        <h2 style="color: #4b2e0e; margin: 0 0 10px 0; font-size: 1.5rem;">Security Verification</h2>
        <p style="color: #666; margin: 0; font-size: 0.9rem;">Please complete the verification below to proceed with checkout</p>
      </div>
      <div style="margin-bottom: 25px;">
        <div id="recaptcha-container" style="display: flex; justify-content: center;">
          <div class="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"></div>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" id="cancel-verification" style="flex: 1; padding: 12px; background-color: #6c757d; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Cancel</button>
        <button type="button" id="proceed-checkout" style="flex: 1; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Proceed</button>
      </div>
      <button id="close-verification" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer;">
        <i class="fa-solid fa-times"></i>
      </button>`;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (typeof grecaptcha !== "undefined") {
        grecaptcha.render(popup.querySelector(".g-recaptcha"), {
          sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
        });
      }
    }, 100);

    popup.querySelector("#close-verification").addEventListener("click", () => overlay.remove());
    popup.querySelector("#cancel-verification").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    popup.querySelector("#proceed-checkout").addEventListener("click", () => {
      if (typeof grecaptcha !== "undefined") {
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
          showAlertBox({ title: "Verification Required", message: "Please complete the security verification (reCAPTCHA).", type: "warning" });
          return;
        }
      }
      overlay.remove();
      showCheckoutPopup();
    });
  };

  const showCheckoutPopup = () => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center; z-index: 10000;`;

    const popup = document.createElement("div");
    popup.style.cssText = `
      background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      max-width: 450px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;`;

    const items = getStoredCart();
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const total = subtotal * 1.05; // 5% tax

    popup.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <i class="fa-solid fa-credit-card" style="font-size: 2.5rem; color: #4b2e0e; margin-bottom: 10px;"></i>
        <h2 style="color: #4b2e0e; margin: 0; font-size: 1.8rem;">Checkout</h2>
        <p style="color: #666; margin: 5px 0 0 0;">Complete your purchase</p>
      </div>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #4b2e0e; font-size: 1.2rem;">Order Summary</h3>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #666;">Total Amount:</span>
          <span style="font-size: 1.3rem; font-weight: bold; color: #4b2e0e;">${formatCurrency(total)}</span>
        </div>
      </div>
      <form id="checkout-form">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4b2e0e;">Card Number</label>
          <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4b2e0e;">Expiry Date</label>
            <input type="text" id="expiry-date" placeholder="MM/YY" maxlength="5" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4b2e0e;">CVV</label>
            <input type="text" id="cvv" placeholder="123" maxlength="4" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4b2e0e;">Cardholder Name</label>
          <input type="text" id="cardholder-name" placeholder="John Doe" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4b2e0e;">Password</label>
          <input type="password" id="payment-password" placeholder="Enter your password" required style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" id="cancel-checkout" style="flex: 1; padding: 12px; background-color: #6c757d; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Cancel</button>
          <button type="submit" id="confirm-payment" style="flex: 2; padding: 12px; background-color: #28a745; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">
            <i class="fa-solid fa-lock" style="margin-right: 8px;"></i>Pay ${formatCurrency(total)}
          </button>
        </div>
      </form>
      <button id="close-checkout" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer;">
        <i class="fa-solid fa-times"></i>
      </button>`;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Input formatting
    const cardNumberInput = popup.querySelector("#card-number");
    const expiryDateInput = popup.querySelector("#expiry-date");
    const cvvInput = popup.querySelector("#cvv");

    cardNumberInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/g, "");
      e.target.value = value.match(/.{1,4}/g)?.join(" ") || value;
    });
    expiryDateInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) value = value.substring(0, 2) + "/" + value.substring(2, 4);
      e.target.value = value;
    });
    cvvInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    });

    // Close events
    popup.querySelector("#close-checkout").addEventListener("click", () => overlay.remove());
    popup.querySelector("#cancel-checkout").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // Submit
    popup.querySelector("#checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const cardNumber = popup.querySelector("#card-number").value.replace(/\s/g, "");
      const expiryDate = popup.querySelector("#expiry-date").value;
      const cvv = popup.querySelector("#cvv").value;
      const cardholderName = popup.querySelector("#cardholder-name").value;
      const password = popup.querySelector("#payment-password").value;

      if (!cardNumber || !expiryDate || !cvv || !cardholderName || !password) {
        showAlertBox({ title: "Missing Information", message: "Please fill in all fields.", type: "error" });
        return;
      }
      if (cardNumber.length < 13) {
        showAlertBox({ title: "Invalid Card Number", message: "Please enter a valid card number.", type: "error" });
        return;
      }
      if (cvv.length < 3) {
        showAlertBox({ title: "Invalid CVV", message: "Please enter a valid CVV.", type: "error" });
        return;
      }

      const confirmBtn = popup.querySelector("#confirm-payment");
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i>Processing...';
      confirmBtn.disabled = true;

      setTimeout(() => {
        // Clear cart
        setStoredCart([]);
        renderCart();
        updateTotalPrice();
        overlay.remove();
        if (cart) cart.classList.remove("active");
        showPaymentSuccessModal();
      }, 1500);
    });
  };

  const showPaymentSuccessModal = () => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 10001;`;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      text-align: center; max-width: 400px; width: 90%;`;

    modal.innerHTML = `
      <div style="color: #28a745; font-size: 4rem; margin-bottom: 20px;">
        <i class="fa-solid fa-check-circle"></i>
      </div>
      <h2 style="color: #4b2e0e; margin-bottom: 15px; font-size: 1.8rem;">Payment Successful!</h2>
      <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">Thank you for your purchase! Your order has been confirmed and will be processed shortly.</p>
      <button style="padding: 12px 30px; background-color: #28a745; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Continue Shopping</button>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector("button").addEventListener("click", () => overlay.remove());
    setTimeout(() => overlay.remove(), 5000);
  };

  // ---------- High-level button bindings ----------
  if (buyNowButton) {
    buyNowButton.addEventListener("click", () => {
      const items = getStoredCart();
      if (!items.length) {
        showAlertBox({ title: "Cart is empty", message: "Add items to your cart to proceed to checkout.", type: "info" });
        return;
      }
      showRecaptchaVerification();
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      const items = getStoredCart();
      if (!items.length) {
        showAlertBox({ title: "Cart is empty", message: "There are no items to clear.", type: "info" });
        return;
      }
      setStoredCart([]);
      renderCart();
      updateTotalPrice();
      showAlertBox({ title: "Cart Cleared", message: "All items cleared from cart!", type: "success" });
      if (cart) cart.classList.remove("active");
    });
  }

  if (cartIcon && cart) {
    cartIcon.addEventListener("click", () => {
      // If used as a drawer elsewhere
      cart.classList.add("active");
    });
  }

  // ---------- Mark active nav link based on current URL ----------
  const markActiveNav = () => {
    const current = window.location.pathname.split('/').pop() || 'homepage.html';
    const selectors = [
      'header .nav-menu a[href]',
      'footer .footer-section a[href]'
    ];
    const links = document.querySelectorAll(selectors.join(','));
    links.forEach(a => {
      try {
        const href = a.getAttribute('href');
        if (!href) return;
        // Normalize relative paths
        const target = href.split('/').pop();
        if (target && target === current) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        } else if (a.classList.contains('active') && target && target !== current) {
          // Clean up if navigating between pages without full reload (SPA-like)
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        }
      } catch {}
    });
  };

  // ---------- Initial load ----------
  updateCartCount();
  renderCart();
  updateTotalPrice();
  markActiveNav();
});
