import {
  auth,
  db,
  googleProvider
} from "./firebase-config.js";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* -----------------------------
   PRODUCTS
----------------------------- */

export const products = [
  {
    id: "weekly",
    name: "Weekly Offer",
    description: "Special weekly top-up package.",
    price: 99,
    icon: "💎"
  },
  {
    id: "monthly",
    name: "Monthly Offer",
    description: "Monthly premium top-up package.",
    price: 299,
    icon: "💎"
  },
  {
    id: "premium",
    name: "Premium Users",
    description: "Exclusive package for premium users.",
    price: 499,
    icon: "👑"
  },
  {
    id: "diamond25",
    name: "Free 25 Diamond Voucher",
    description: "25 diamond voucher package.",
    price: 0,
    icon: "💎"
  },
  {
    id: "diamond100",
    name: "100 Diamond",
    description: "Fast diamond top-up package.",
    price: 150,
    icon: "💎"
  },
  {
    id: "diamond310",
    name: "310 Diamond",
    description: "Popular diamond package.",
    price: 430,
    icon: "💎"
  },
  {
    id: "diamond520",
    name: "520 Diamond",
    description: "Large diamond package.",
    price: 690,
    icon: "💎"
  },
  {
    id: "diamond1060",
    name: "1060 Diamond",
    description: "Premium diamond package.",
    price: 1290,
    icon: "💎"
  },
  {
    id: "diamond2180",
    name: "2180 Diamond",
    description: "Mega diamond package.",
    price: 2490,
    icon: "💎"
  }
];


/* -----------------------------
   HELPERS
----------------------------- */

export function getProduct(id) {
  return products.find(product => product.id === id);
}

export function requireLogin(returnUrl = window.location.href) {
  if (!auth.currentUser) {
    window.location.href =
      `login.html?redirect=${encodeURIComponent(returnUrl)}`;
    return false;
  }

  return true;
}


/* -----------------------------
   GOOGLE LOGIN
----------------------------- */

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    return result.user;

  } catch (error) {
    console.error(error);
    throw error;
  }
}


/* -----------------------------
   EMAIL LOGIN
----------------------------- */

export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return result.user;

  } catch (error) {
    console.error(error);
    throw error;
  }
}


/* -----------------------------
   REGISTER
----------------------------- */

export async function registerWithEmail(
  name,
  email,
  password
) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(result.user, {
      displayName: name
    });

    return result.user;

  } catch (error) {
    console.error(error);
    throw error;
  }
}


/* -----------------------------
   LOGOUT
----------------------------- */

export async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}


/* -----------------------------
   SAVE ORDER
----------------------------- */

export async function createOrder(
  product,
  playerId,
  phone
) {
  if (!auth.currentUser) {
    throw new Error("LOGIN_REQUIRED");
  }

  const order = {
    userId: auth.currentUser.uid,

    userEmail:
      auth.currentUser.email || "",

    userName:
      auth.currentUser.displayName || "",

    productId: product.id,

    productName: product.name,

    price: product.price,

    playerId: playerId,

    phone: phone,

    status: "Pending",

    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(
    collection(db, "orders"),
    order
  );

  return docRef.id;
}


/* -----------------------------
   LOAD USER ORDERS
----------------------------- */

export async function loadUserOrders() {
  if (!auth.currentUser) {
    return [];
  }

  const q = query(
    collection(db, "orders"),
    where("userId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}


/* -----------------------------
   AUTH UI
----------------------------- */

export function setupAuthUI() {

  onAuthStateChanged(auth, user => {

    document.querySelectorAll(
      "[data-user-name]"
    ).forEach(element => {

      element.textContent =
        user?.displayName ||
        user?.email ||
        "Guest";

    });


    document.querySelectorAll(
      "[data-login-button]"
    ).forEach(button => {

      if (user) {

        button.textContent = "Account";

        button.onclick = () => {
          window.location.href = "account.html";
        };

      } else {

        button.textContent = "Login";

        button.onclick = () => {
          window.location.href = "login.html";
        };

      }

    });


    document.querySelectorAll(
      "[data-logout]"
    ).forEach(button => {

      button.onclick = logout;

    });


    document.querySelectorAll(
      "[data-protected]"
    ).forEach(element => {

      element.onclick = () => {
        requireLogin();
      };

    });

  });
}


/* -----------------------------
   BOTTOM NAV
----------------------------- */

export function renderBottomNav(active = "home") {

  const nav = document.createElement("nav");

  nav.className = "bottom-nav";

  nav.innerHTML = `
    <a class="nav-item ${active === "home" ? "active" : ""}"
       href="index.html">
      <span class="nav-icon">⌂</span>
      Home
    </a>

    <a class="nav-item ${active === "orders" ? "active" : ""}"
       href="orders.html">
      <span class="nav-icon">▣</span>
      My Orders
    </a>

    <a class="add-nav"
       href="index.html#products">
       +
    </a>

    <a class="nav-item"
       href="index.html#codes">
      <span class="nav-icon">▤</span>
      My Codes
    </a>

    <a class="nav-item ${active === "account" ? "active" : ""}"
       href="account.html">
      <span class="nav-icon">♙</span>
      My Account
    </a>
  `;

  document.body.appendChild(nav);
}


/* -----------------------------
   HEADER
----------------------------- */

export function renderHeader() {

  const header = document.createElement("header");

  header.className = "top-header";

  header.innerHTML = `
    <a href="index.html" class="brand">

      <div class="brand-logo">
        W
      </div>

      <div class="brand-name">
        Water Price<br>
        Top Up BD
      </div>

    </a>

    <div class="header-actions">

      <button class="wallet-btn">
        ৳ <span id="headerBalance">0</span>
      </button>

      <button
        class="login-btn"
        data-login-button>
        Login
      </button>

    </div>
  `;

  document.body.prepend(header);
}


/* -----------------------------
   START GLOBAL UI
----------------------------- */

setupAuthUI();