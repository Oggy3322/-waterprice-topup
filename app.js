// ======================================================
// Water Price Top Up BD
// app.js
// Login → UID → Order → Rank → My Orders
// ======================================================

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";


// ======================================================
// 1. RANK SYSTEM
// ======================================================

const RANKS = [
  {
    name: "Bronze",
    min: 0,
    max: 499,
    logo: "assets/ranks/bronze.png"
  },
  {
    name: "Silver",
    min: 500,
    max: 1499,
    logo: "assets/ranks/silver.png"
  },
  {
    name: "Gold",
    min: 1500,
    max: 2999,
    logo: "assets/ranks/gold.png"
  },
  {
    name: "Platinum",
    min: 3000,
    max: 4999,
    logo: "assets/ranks/platinum.png"
  },
  {
    name: "Diamond",
    min: 5000,
    max: 9999,
    logo: "assets/ranks/diamond.png"
  },
  {
    name: "Heroic",
    min: 10000,
    max: 19999,
    logo: "assets/ranks/heroic.png"
  },
  {
    name: "Grandmaster",
    min: 20000,
    max: Infinity,
    logo: "assets/ranks/grandmaster.png"
  }
];


// ======================================================
// 2. GET CURRENT RANK
// ======================================================

function getRank(totalTopUp) {

  totalTopUp = Number(totalTopUp) || 0;

  let currentRank = RANKS[0];

  for (const rank of RANKS) {
    if (totalTopUp >= rank.min) {
      currentRank = rank;
    }
  }

  return currentRank;
}


// ======================================================
// 3. FORMAT MONEY
// ======================================================

function money(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
}


// ======================================================
// 4. SHOW USER DATA
// ======================================================

function showUser(user) {

  if (!user) return;

  const name =
    user.displayName ||
    user.email?.split("@")[0] ||
    "User";

  const email = user.email || "";

  // Name
  document.querySelectorAll("[data-user-name]").forEach(el => {
    el.textContent = name;
  });

  // Email
  document.querySelectorAll("[data-user-email]").forEach(el => {
    el.textContent = email;
  });

  // UID
  document.querySelectorAll("[data-user-uid]").forEach(el => {
    el.textContent = user.uid;
  });

  // Initial
  document.querySelectorAll("[data-user-initial]").forEach(el => {
    el.textContent = name.charAt(0).toUpperCase();
  });
}


// ======================================================
// 5. LOAD USER PROFILE
// ======================================================

async function loadUserProfile(user) {

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      document.querySelectorAll("[data-user-name]").forEach(el => {
        el.textContent =
          data.name ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "User";
      });

      document.querySelectorAll("[data-user-email]").forEach(el => {
        el.textContent =
          data.email ||
          user.email ||
          "";
      });

    }

  } catch (error) {

    console.error("Profile loading error:", error);

  }
}


// ======================================================
// 6. CALCULATE TOTAL TOP-UP
// ======================================================

async function getTotalTopUp(uid) {

  let total = 0;

  try {

    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("userId", "==", uid)
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(order => {

      const data = order.data();

      // Only count successful/completed orders
      const status =
        String(data.status || "pending").toLowerCase();

      if (
        status === "completed" ||
        status === "approved" ||
        status === "success" ||
        status === "paid"
      ) {

        total += Number(
          data.amount ||
          data.price ||
          data.total ||
          0
        );

      }

    });

  } catch (error) {

    console.error("Top-up calculation error:", error);

  }

  return total;
}


// ======================================================
// 7. UPDATE RANK
// ======================================================

async function updateUserRank(user) {

  if (!user) return;

  try {

    const totalTopUp = await getTotalTopUp(user.uid);

    const rank = getRank(totalTopUp);

    const userRef = doc(db, "users", user.uid);

    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email || "",
        name:
          user.displayName ||
          user.email?.split("@")[0] ||
          "User",

        totalTopUp: totalTopUp,

        rank: rank.name,

        rankLogo: rank.logo,

        updatedAt: serverTimestamp()

      },
      {
        merge: true
      }
    );

    showRank(rank, totalTopUp);

  } catch (error) {

    console.error("Rank update error:", error);

  }
}


// ======================================================
// 8. SHOW RANK ON ACCOUNT PAGE
// ======================================================

function showRank(rank, totalTopUp) {

  document.querySelectorAll("[data-rank-name]").forEach(el => {
    el.textContent = rank.name;
  });

  document.querySelectorAll("[data-rank-logo]").forEach(el => {

    el.src = rank.logo;
    el.alt = rank.name;

    // premium glow
    el.classList.add("rank-glow");

  });

  document.querySelectorAll("[data-total-topup]").forEach(el => {
    el.textContent = money(totalTopUp);
  });

  // Current rank text
  document.querySelectorAll("[data-current-rank]").forEach(el => {
    el.textContent = rank.name;
  });
}


// ======================================================
// 9. LOAD MY ORDERS
// ======================================================

async function loadMyOrders(user) {

  const container =
    document.querySelector("#ordersList") ||
    document.querySelector("[data-orders-list]");

  if (!container) return;

  container.innerHTML = `
    <div class="orders-loading">
      Loading your orders...
    </div>
  `;

  try {

    const ordersRef = collection(db, "orders");

    // IMPORTANT:
    // Only current user's UID
    const q = query(
      ordersRef,
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

      container.innerHTML = `
        <div class="no-orders">
          <div class="no-orders-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>Your orders will appear here.</p>
        </div>
      `;

      return;
    }


    const orders = [];

    snapshot.forEach(item => {

      orders.push({
        id: item.id,
        ...item.data()
      });

    });


    // Newest first
    orders.sort((a, b) => {

      const aTime =
        a.createdAt?.seconds ||
        0;

      const bTime =
        b.createdAt?.seconds ||
        0;

      return bTime - aTime;

    });


    container.innerHTML = "";


    orders.forEach(order => {

      const status =
        order.status ||
        "Pending";

      const amount =
        Number(
          order.amount ||
          order.price ||
          order.total ||
          0
        );

      const packageName =
        order.packageName ||
        order.productName ||
        order.package ||
        "Top Up";

      const orderId =
        order.orderId ||
        order.id;


      const card = document.createElement("div");

      card.className = "order-card";

      card.innerHTML = `

        <div class="order-card-top">

          <div>
            <h3>${escapeHTML(packageName)}</h3>

            <span class="order-id">
              Order #${escapeHTML(orderId)}
            </span>
          </div>

          <span class="order-status ${statusClass(status)}">
            ${escapeHTML(status)}
          </span>

        </div>


        <div class="order-card-info">

          <div>
            <small>Amount</small>
            <strong>${money(amount)}</strong>
          </div>

          <div>
            <small>UID</small>
            <strong>
              ${escapeHTML(order.uid || order.gameUid || "-")}
            </strong>
          </div>

        </div>

      `;

      container.appendChild(card);

    });


  } catch (error) {

    console.error("Orders loading error:", error);

    container.innerHTML = `
      <div class="orders-error">
        <h3>Unable to load orders</h3>
        <p>Please try again later.</p>
      </div>
    `;

  }

}


// ======================================================
// 10. STATUS CLASS
// ======================================================

function statusClass(status) {

  const value =
    String(status || "")
      .toLowerCase();

  if (
    value === "completed" ||
    value === "approved" ||
    value === "success" ||
    value === "paid"
  ) {

    return "status-success";

  }

  if (
    value === "cancelled" ||
    value === "canceled" ||
    value === "rejected"
  ) {

    return "status-danger";

  }

  return "status-pending";
}


// ======================================================
// 11. CREATE ORDER
// ======================================================

async function createOrder(orderData) {

  const user = auth.currentUser;

  // Login required
  if (!user) {

    alert("Please login first.");

    window.location.href = "login.html";

    return null;
  }


  try {

    const amount = Number(
      orderData.amount ||
      orderData.price ||
      orderData.total ||
      0
    );


    const order = {

      // VERY IMPORTANT
      // Current Firebase Auth UID
      userId: user.uid,

      // Game UID / customer UID
      uid:
        orderData.uid ||
        orderData.gameUid ||
        "",

      email: user.email || "",

      userName:
        user.displayName ||
        user.email?.split("@")[0] ||
        "User",

      packageName:
        orderData.packageName ||
        orderData.productName ||
        orderData.package ||
        "Top Up",

      amount: amount,

      price: amount,

      status: "pending",

      createdAt: serverTimestamp()

    };


    const docRef = await addDoc(
      collection(db, "orders"),
      order
    );


    // Update rank after new order
    await updateUserRank(user);


    return docRef.id;


  } catch (error) {

    console.error("Order creation error:", error);

    alert(
      "Order failed. Please try again."
    );

    return null;

  }

}


// ======================================================
// 12. ORDER FORM AUTO HANDLER
// ======================================================

function setupOrderForm() {

  const form =
    document.querySelector("#orderForm") ||
    document.querySelector("[data-order-form]");

  if (!form) return;


  form.addEventListener("submit", async event => {

    event.preventDefault();


    const user = auth.currentUser;


    if (!user) {

      alert("Please login first.");

      window.location.href = "login.html";

      return;

    }


    // Try to find common input names
    const gameUidInput =
      form.querySelector(
        '[name="uid"], [name="gameUid"], #uid, #gameUid'
      );

    const packageInput =
      form.querySelector(
        '[name="packageName"], [name="package"], #packageName'
      );

    const amountInput =
      form.querySelector(
        '[name="amount"], [name="price"], #amount, #price'
      );


    const gameUid =
      gameUidInput?.value?.trim() || "";

    const packageName =
      packageInput?.value?.trim() ||
      "Top Up";

    const amount =
      Number(amountInput?.value || 0);


    if (!gameUid) {

      alert("Please enter your UID.");

      return;

    }


    if (amount <= 0) {

      alert("Please select a valid package.");

      return;

    }


    const orderId = await createOrder({

      uid: gameUid,

      packageName: packageName,

      amount: amount

    });


    if (orderId) {

      alert(
        "Order placed successfully!"
      );


      form.reset();


      // Refresh rank
      await updateUserRank(user);


      // If order page exists
      if (
        document.querySelector("#ordersList") ||
        document.querySelector("[data-orders-list]")
      ) {

        await loadMyOrders(user);

      }

    }

  });

}


// ======================================================
// 13. LOGOUT
// ======================================================

function setupLogout() {

  document.querySelectorAll(
    "#logoutBtn, [data-logout]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      async () => {

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
    );

  });

}


// ======================================================
// 14. LOGIN STATE
// ======================================================

onAuthStateChanged(auth, async user => {

  const loginButtons =
    document.querySelectorAll(
      "#loginBtn, [data-login]"
    );

  const accountButtons =
    document.querySelectorAll(
      "#accountBtn, [data-account]"
    );


  if (user) {

    console.log(
      "Logged in UID:",
      user.uid
    );


    // Show user
    showUser(user);

    await loadUserProfile(user);


    // Login button → Account
    loginButtons.forEach(button => {

      button.textContent =
        "Account";

      button.onclick = () => {

        window.location.href =
          "account.html";

      };

    });


    // Account buttons
    accountButtons.forEach(button => {

      button.onclick = () => {

        window.location.href =
          "account.html";

      };

    });


    // Rank
    await updateUserRank(user);


    // Orders page
    if (
      document.querySelector("#ordersList") ||
      document.querySelector("[data-orders-list]")
    ) {

      await loadMyOrders(user);

    }


  } else {

    console.log(
      "No user logged in"
    );


    // Login buttons
    loginButtons.forEach(button => {

      button.textContent =
        "Login";

      button.onclick = () => {

        window.location.href =
          "login.html";

      };

    });


    // Account page protection
    if (
      window.location.pathname.endsWith(
        "account.html"
      )
    ) {

      window.location.href =
        "login.html";

      return;

    }


    // Orders page protection
    if (
      window.location.pathname.endsWith(
        "orders.html"
      )
    ) {

      window.location.href =
        "login.html";

      return;

    }

  }

});


// ======================================================
// 15. HTML ESCAPE
// ======================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ======================================================
// 16. PAGE START
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupOrderForm();

    setupLogout();

  }
);


// ======================================================
// 17. MAKE FUNCTIONS AVAILABLE
// ======================================================

window.createOrder = createOrder;
window.loadMyOrders = loadMyOrders;
window.updateUserRank = updateUserRank;
window.getRank = getRank;
window.RANKS = RANKS;