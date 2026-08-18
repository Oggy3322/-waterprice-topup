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
  updateProfile,
  onAuthStateChanged
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


/* =====================================================
   PRODUCTS
===================================================== */

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


/* =====================================================
   GET PRODUCT
===================================================== */

export function getProduct(id) {
  return products.find(product => product.id === id);
}


/* =====================================================
   LOGIN REQUIRED
===================================================== */

export function requireLogin(returnUrl = window.location.href) {

  if (!auth.currentUser) {

    window.location.href =
      `login.html?redirect=${encodeURIComponent(returnUrl)}`;

    return false;
  }

  return true;
}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

export async function loginWithGoogle() {

  try {

    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    return result.user;

  } catch (error) {

    console.error(
      "Google login error:",
      error
    );

    throw error;
  }
}


/* =====================================================
   EMAIL LOGIN
===================================================== */

export async function loginWithEmail(
  email,
  password
) {

  try {

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return result.user;

  } catch (error) {

    console.error(
      "Email login error:",
      error
    );

    throw error;
  }
}


/* =====================================================
   REGISTER
===================================================== */

export async function registerWithEmail(
  name,
  email,
  password
) {

  try {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(
      result.user,
      {
        displayName: name
      }
    );

    return result.user;

  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    throw error;
  }
}


/* =====================================================
   LOGOUT
===================================================== */

export async function logout() {

  try {

    await signOut(auth);

    window.location.href =
      "index.html";

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }
}


/* =====================================================
   CREATE ORDER
   IMPORTANT:
   uid is saved with the order.
===================================================== */

export async function createOrder(
  product,
  playerId,
  phone
) {

  const user =
    auth.currentUser;


  if (!user) {

    throw new Error(
      "LOGIN_REQUIRED"
    );
  }


  const orderData = {

    /*
      THIS IS THE USER OWNER
    */
    uid: user.uid,

    /*
      Extra user information
    */
    email:
      user.email || "",

    userName:
      user.displayName || "",

    /*
      Product
    */
    productId:
      product.id,

    productName:
      product.name,

    price:
      Number(product.price),

    /*
      Customer information
    */
    playerId:
      playerId,

    phone:
      phone,

    /*
      Order status
    */
    status:
      "Pending",

    /*
      Firebase server time
    */
    createdAt:
      serverTimestamp()
  };


  /*
    Firestore creates the order here.
  */

  const docRef =
    await addDoc(
      collection(db, "orders"),
      orderData
    );


  return docRef.id;
}


/* =====================================================
   LOAD CURRENT USER'S ORDERS ONLY
===================================================== */

export async function loadUserOrders() {

  const user =
    auth.currentUser;


  if (!user) {

    throw new Error(
      "LOGIN_REQUIRED"
    );
  }


  /*
    IMPORTANT:

    Only documents where
    uid == current user's uid
    will be requested.
  */

  const ordersQuery =
    query(

      collection(
        db,
        "orders"
      ),

      where(
        "uid",
        "==",
        user.uid
      ),

      orderBy(
        "createdAt",
        "desc"
      )
    );


  const snapshot =
    await getDocs(
      ordersQuery
    );


  const orders = [];


  snapshot.forEach(
    documentSnapshot => {

      orders.push({

        id:
          documentSnapshot.id,

        ...documentSnapshot.data()

      });

    }
  );


  return orders;
}


/* =====================================================
   HEADER
===================================================== */

export function renderHeader() {

  const oldHeader =
    document.querySelector(
      ".top-header"
    );

  if (oldHeader) {
    oldHeader.remove();
  }


  const header =
    document.createElement(
      "header"
    );

  header.className =
    "top-header";


  header.innerHTML = `

    <a
      href="index.html"
      class="brand">

      <div class="brand-logo">
        W
      </div>

      <div class="brand-name">
        Water Price<br>
        Top Up BD
      </div>

    </a>


    <div class="header-actions">

      <button
        class="wallet-btn">

        ৳ <span id="headerBalance">
          0
        </span>

      </button>


      <button
        class="login-btn"
        id="headerLoginButton">

        Login

      </button>

    </div>

  `;


  document.body.prepend(
    header
  );


  const loginButton =
    document.getElementById(
      "headerLoginButton"
    );


  onAuthStateChanged(
    auth,
    user => {

      if (!loginButton) {
        return;
      }


      if (user) {

        loginButton.textContent =
          "Account";

        loginButton.onclick =
          () => {

            window.location.href =
              "account.html";

          };

      } else {

        loginButton.textContent =
          "Login";

        loginButton.onclick =
          () => {

            window.location.href =
              "login.html";

          };

      }

    }
  );
}


/* =====================================================
   BOTTOM NAVIGATION
===================================================== */

export function renderBottomNav(
  active = "home"
) {

  const oldNav =
    document.querySelector(
      ".bottom-nav"
    );

  if (oldNav) {
    oldNav.remove();
  }


  const nav =
    document.createElement(
      "nav"
    );

  nav.className =
    "bottom-nav";


  nav.innerHTML = `

    <a
      class="nav-item ${
        active === "home"
          ? "active"
          : ""
      }"
      href="index.html">

      <span class="nav-icon">
        ⌂
      </span>

      Home

    </a>


    <a
      class="nav-item ${
        active === "orders"
          ? "active"
          : ""
      }"
      href="orders.html">

      <span class="nav-icon">
        ▣
      </span>

      My Orders

    </a>


    <a
      class="add-nav"
      href="index.html#products">

      +

    </a>


    <a
      class="nav-item"
      href="index.html#codes">

      <span class="nav-icon">
        ▤
      </span>

      My Codes

    </a>


    <a
      class="nav-item ${
        active === "account"
          ? "active"
          : ""
      }"
      href="account.html">

      <span class="nav-icon">
        ♙
      </span>

      My Account

    </a>

  `;


  document.body.appendChild(
    nav
  );
}


/* =====================================================
   GLOBAL AUTH UI
===================================================== */

onAuthStateChanged(
  auth,
  user => {

    document
      .querySelectorAll(
        "[data-user-name]"
      )
      .forEach(
        element => {

          element.textContent =
            user?.displayName ||
            user?.email ||
            "Guest";

        }
      );

  }
);