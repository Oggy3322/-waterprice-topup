// app.js

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth, db } from "./firebase-config.js";


// ======================================================
// GLOBAL USER
// ======================================================

let currentUser = null;


// ======================================================
// LOGIN STATE
// ======================================================

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;

  if (user) {
    console.log("Logged in UID:", user.uid);
    console.log("User Email:", user.email);
  } else {
    console.log("No user logged in");
  }

});


// ======================================================
// CREATE ORDER
// ======================================================

async function createOrder(orderData = {}) {

  // User login না করলে order করা যাবে না
  if (!auth.currentUser) {

    alert("Please login first.");

    window.location.href = "login.html";

    return null;
  }


  const user = auth.currentUser;


  try {

    // IMPORTANT:
    // UID automatically save হবে
    const order = {

      userId: user.uid,

      userEmail: user.email || "",

      userName: user.displayName || "",

      productId: orderData.productId || "",

      productName: orderData.productName || "Unknown Product",

      amount: Number(orderData.amount || 0),

      quantity: Number(orderData.quantity || 1),

      phone: orderData.phone || "",

      status: "pending",

      createdAt: serverTimestamp()

    };


    // Firestore orders collection
    const docRef = await addDoc(
      collection(db, "orders"),
      order
    );


    console.log("Order created:", docRef.id);

    console.log("Saved UID:", user.uid);


    alert("Order placed successfully!");


    // Order complete হওয়ার পরে My Orders
    window.location.href = "orders.html";


    return docRef.id;

  } catch (error) {

    console.error("Order error:", error);

    alert(
      "Order failed: " + error.message
    );

    return null;
  }
}


// ======================================================
// MAKE createOrder AVAILABLE TO OTHER HTML FILES
// ======================================================

window.createOrder = createOrder;


// ======================================================
// LOAD MY ORDERS
// ======================================================

async function loadMyOrders() {

  const ordersContainer =
    document.getElementById("ordersContainer");


  if (!ordersContainer) {
    return;
  }


  // Login check
  if (!auth.currentUser) {

    ordersContainer.innerHTML = `
      <div class="empty-box">
        <h3>Login Required</h3>
        <p>Please login to see your orders.</p>

        <a href="login.html" class="login-btn">
          Login
        </a>
      </div>
    `;

    return;
  }


  const uid = auth.currentUser.uid;


  console.log("Loading orders for UID:", uid);


  ordersContainer.innerHTML = `
    <div class="loading">
      Loading your orders...
    </div>
  `;


  try {

    /*
      IMPORTANT:

      আমরা শুধু current user's UID দিয়ে query করছি।

      অন্য user-এর order এখানে আসবে না।
    */

    const ordersQuery = query(
      collection(db, "orders"),

      where(
        "userId",
        "==",
        uid
      ),

      orderBy(
        "createdAt",
        "desc"
      )
    );


    const snapshot =
      await getDocs(ordersQuery);


    if (snapshot.empty) {

      ordersContainer.innerHTML = `
        <div class="empty-box">

          <div class="empty-icon">
            📦
          </div>

          <h3>No Orders Yet</h3>

          <p>
            You haven't placed any orders yet.
          </p>

          <a href="index.html" class="shop-btn">
            Browse Offers
          </a>

        </div>
      `;

      return;
    }


    let html = "";


    snapshot.forEach((doc) => {

      const order = doc.data();


      let date = "Processing...";


      if (order.createdAt) {

        const timestamp =
          order.createdAt.toDate();

        date =
          timestamp.toLocaleString();

      }


      html += `

        <div class="order-card">

          <div class="order-top">

            <div>

              <span class="order-label">
                ORDER ID
              </span>

              <strong>
                #${doc.id.substring(0, 10)}
              </strong>

            </div>

            <span class="status ${getStatusClass(order.status)}">
              ${order.status || "pending"}
            </span>

          </div>


          <div class="order-info">

            <h3>
              ${escapeHTML(order.productName || "Product")}
            </h3>


            <p>
              Quantity:
              <strong>
                ${order.quantity || 1}
              </strong>
            </p>


            <p>
              Amount:
              <strong>
                ৳${Number(order.amount || 0).toFixed(2)}
              </strong>
            </p>


            ${
              order.phone
                ? `
                  <p>
                    Phone:
                    <strong>
                      ${escapeHTML(order.phone)}
                    </strong>
                  </p>
                `
                : ""
            }


            <p class="order-date">
              ${date}
            </p>

          </div>

        </div>

      `;

    });


    ordersContainer.innerHTML = html;


  } catch (error) {

    console.error(
      "Load orders error:",
      error
    );


    ordersContainer.innerHTML = `

      <div class="error-box">

        <h3>Could not load orders</h3>

        <p>
          ${escapeHTML(error.message)}
        </p>

      </div>

    `;

  }

}


// ======================================================
// STATUS CLASS
// ======================================================

function getStatusClass(status) {

  status =
    String(status || "pending")
      .toLowerCase();


  if (status === "completed") {
    return "completed";
  }

  if (status === "cancelled") {
    return "cancelled";
  }

  return "pending";
}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ======================================================
// AUTOMATICALLY LOAD ORDERS PAGE
// ======================================================

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;


  if (
    user &&
    document.getElementById("ordersContainer")
  ) {

    loadMyOrders();

  }

});


// ======================================================
// LOGOUT FUNCTION
// ======================================================

async function logoutUser() {

  try {

    const {
      signOut
    } = await import(
      "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
    );


    await signOut(auth);

    window.location.href =
      "login.html";

  } catch (error) {

    console.error(error);

    alert(
      "Logout failed: " +
      error.message
    );

  }

}


window.logoutUser = logoutUser;