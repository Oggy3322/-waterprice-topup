import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth } from "./firebase-config.js";


// ===============================
// AUTH STATE
// ===============================

onAuthStateChanged(auth, (user) => {

  const loginButtons = document.querySelectorAll("[data-login]");
  const logoutButtons = document.querySelectorAll("[data-logout]");
  const accountNames = document.querySelectorAll("[data-user-name]");

  if (user) {

    loginButtons.forEach(btn => {
      btn.style.display = "none";
    });

    logoutButtons.forEach(btn => {
      btn.style.display = "inline-flex";
    });

    accountNames.forEach(el => {
      el.textContent =
        user.displayName ||
        user.email?.split("@")[0] ||
        "User";
    });

  } else {

    loginButtons.forEach(btn => {
      btn.style.display = "inline-flex";
    });

    logoutButtons.forEach(btn => {
      btn.style.display = "none";
    });

  }

});


// ===============================
// LOGOUT
// ===============================

document.addEventListener("click", async (e) => {

  const logout = e.target.closest("[data-logout]");

  if (!logout) return;

  try {

    await signOut(auth);

    window.location.href = "index.html";

  } catch (error) {

    console.error(error);
    alert("Logout failed.");

  }

});


// ===============================
// ORDER BUTTON
// LOGIN REQUIRED
// ===============================

document.addEventListener("click", (e) => {

  const orderButton = e.target.closest("[data-order]");

  if (!orderButton) return;

  if (!auth.currentUser) {

    window.location.href =
      "login.html?redirect=product.html";

    return;
  }

  const product =
    orderButton.dataset.product || "Top Up Package";

  const price =
    orderButton.dataset.price || "0";

  window.location.href =
    `product.html?product=${encodeURIComponent(product)}&price=${encodeURIComponent(price)}`;

});


// ===============================
// ACCOUNT BUTTON
// ===============================

document.addEventListener("click", (e) => {

  const accountButton = e.target.closest("[data-account]");

  if (!accountButton) return;

  if (!auth.currentUser) {

    window.location.href = "login.html";

  } else {

    window.location.href = "account.html";

  }

});


// ===============================
// MY ORDERS BUTTON
// ===============================

document.addEventListener("click", (e) => {

  const ordersButton = e.target.closest("[data-orders]");

  if (!ordersButton) return;

  if (!auth.currentUser) {

    window.location.href = "login.html";

  } else {

    window.location.href = "orders.html";

  }

});


// ===============================
// MOBILE MENU
// ===============================

document.addEventListener("click", (e) => {

  const menuButton = e.target.closest(".menu-button");

  if (!menuButton) return;

  const menu =
    document.querySelector(".mobile-menu");

  if (menu) {
    menu.classList.toggle("open");
  }

});


// ===============================
// YEAR
// ===============================

document.querySelectorAll("[data-year]").forEach(el => {

  el.textContent = new Date().getFullYear();

});