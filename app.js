import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* =========================
   RANK SYSTEM
========================= */

const RANKS = [

  {
    name: "Bronze",
    min: 0,
    max: 100,
    logo: "assets/ranks/bronze.svg"
  },

  {
    name: "Silver",
    min: 101,
    max: 1000,
    logo: "assets/ranks/silver.svg"
  },

  {
    name: "Gold",
    min: 1001,
    max: 5000,
    logo: "assets/ranks/gold.svg"
  },

  {
    name: "Platinum",
    min: 5001,
    max: 10000,
    logo: "assets/ranks/platinum.svg"
  },

  {
    name: "Diamond",
    min: 10001,
    max: 25000,
    logo: "assets/ranks/diamond.svg"
  },

  {
    name: "Heroic",
    min: 25001,
    max: 50000,
    logo: "assets/ranks/heroic.svg"
  },

  {
    name: "Master",
    min: 50001,
    max: 100000,
    logo: "assets/ranks/master.svg"
  },

  {
    name: "Grand Master",
    min: 100001,
    max: Infinity,
    logo: "assets/ranks/grandmaster.svg"
  }

];


/* =========================
   PRODUCTS
========================= */

/*
   এগুলো এখন DEMO PRICE.
   ভিডিও থেকে exact price পাওয়ার পরে
   শুধু এই section পরিবর্তন করবে।
*/

const PRODUCTS = [

  {
    id: "d115",
    cat: "diamond",
    name: "115 Diamonds",
    detail: "115 💎",
    price: 78,
    icon: "◆"
  },

  {
    id: "d240",
    cat: "diamond",
    name: "240 Diamonds",
    detail: "240 💎",
    price: 156,
    icon: "◆"
  },

  {
    id: "d610",
    cat: "diamond",
    name: "610 Diamonds",
    detail: "610 💎",
    price: 395,
    icon: "◆"
  },

  {
    id: "d1240",
    cat: "diamond",
    name: "1240 Diamonds",
    detail: "1240 💎",
    price: 790,
    icon: "◆"
  },

  {
    id: "d2530",
    cat: "diamond",
    name: "2530 Diamonds",
    detail: "2530 💎",
    price: 1580,
    icon: "◆"
  },

  {
    id: "weekly",
    cat: "weekly",
    name: "Weekly Membership",
    detail: "Weekly",
    price: 156,
    icon: "W"
  },

  {
    id: "weeklyLite",
    cat: "weekly",
    name: "Weekly Lite",
    detail: "Weekly Lite",
    price: 40,
    icon: "W"
  },

  {
    id: "monthly",
    cat: "monthly",
    name: "Monthly Membership",
    detail: "Monthly",
    price: 780,
    icon: "M"
  },

  {
    id: "like200",
    cat: "like",
    name: "200 Likes",
    detail: "FF Like",
    price: 30,
    icon: "♥"
  },

  {
    id: "like400",
    cat: "like",
    name: "400 Likes",
    detail: "FF Like",
    price: 60,
    icon: "♥"
  },

  {
    id: "like600",
    cat: "like",
    name: "600 Likes",
    detail: "FF Like",
    price: 90,
    icon: "♥"
  },

  {
    id: "like1400",
    cat: "like",
    name: "1400 Likes",
    detail: "FF Like",
    price: 200,
    icon: "♥"
  },

  {
    id: "like3000",
    cat: "like",
    name: "3000 Likes",
    detail: "FF Like",
    price: 430,
    icon: "♥"
  },

  {
    id: "like6000",
    cat: "like",
    name: "6000 Likes",
    detail: "FF Like",
    price: 800,
    icon: "♥"
  }

];


const $ = selector =>
  document.querySelector(selector);


const $$ = selector =>
  document.querySelectorAll(selector);


const money = number =>
  `৳${Number(number || 0).toLocaleString("en-BD")}`;


const rankFor = total => {

  return RANKS.reduce(

    (rank, item) =>

      total >= item.min
        ? item
        : rank,

    RANKS[0]

  );

};


const esc = value => {

  return String(value ?? "").replace(

    /[&<>"']/g,

    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])

  );

};


/* =========================
   TOTAL TOPUP
========================= */

async function totalTopup(uid) {

  const snapshot = await getDocs(

    query(

      collection(db, "orders"),

      where("userId", "==", uid)

    )

  );

  let total = 0;

  snapshot.forEach(document => {

    const data = document.data();

    const status =
      String(data.status || "pending")
        .toLowerCase();

    if (

      [
        "completed",
        "approved",
        "success",
        "paid"
      ].includes(status)

    ) {

      total += Number(data.amount || 0);

    }

  });

  return total;
}


/* =========================
   SAVE USER PROFILE
========================= */

async function saveProfile(user) {

  const reference =
    doc(db, "users", user.uid);

  const old =
    await getDoc(reference);

  const oldData =
    old.exists()
      ? old.data()
      : {};

  await setDoc(

    reference,

    {

      uid: user.uid,

      email: user.email || "",

      name:
        user.displayName ||
        oldData.name ||
        user.email?.split("@")[0] ||
        "User",

      updatedAt:
        serverTimestamp()

    },

    {
      merge: true
    }

  );

}


/* =========================
   RENDER USER
========================= */

async function renderUser(user) {

  if (!user) return;


  const initial = (

    user.displayName ||
    user.email ||
    "U"

  ).charAt(0).toUpperCase();


  $$(".avatar").forEach(

    element => {

      element.textContent =
        initial;

    }

  );


  $$("[data-user-name]")
    .forEach(

      element => {

        element.textContent =
          user.displayName ||
          user.email?.split("@")[0] ||
          "User";

      }

    );


  $$("[data-user-email]")
    .forEach(

      element => {

        element.textContent =
          user.email || "";

      }

    );


  $$("[data-user-uid]")
    .forEach(

      element => {

        element.textContent =
          user.uid;

      }

    );


  $$("[data-user-initial]")
    .forEach(

      element => {

        element.textContent =
          initial;

      }

    );


  const total =
    await totalTopup(user.uid);


  const rank =
    rankFor(total);


  $$("[data-total-topup]")
    .forEach(

      element => {

        element.textContent =
          money(total);

      }

    );


  $$("[data-rank-name]")
    .forEach(

      element => {

        element.textContent =
          rank.name;

      }

    );


  $$("[data-rank-logo]")
    .forEach(

      element => {

        element.src =
          rank.logo;

        element.alt =
          rank.name;

      }

    );


  const rankList =
    $("[data-rank-list]");


  if (rankList) {

    rankList.innerHTML =

      RANKS.map(

        item => `

          <div class="rank-item ${
            item.name === rank.name
              ? "current"
              : ""
          }">

            <img
              src="${item.logo}"
              alt="${item.name}"
            >

            <div>

              <b>${item.name}</b>

              <div class="muted">

                ${money(item.min)}

                ${
                  item.max === Infinity
                    ? "+"
                    : " – " + money(item.max)
                }

              </div>

            </div>

            <span class="lock">

              ${
                item.name === rank.name
                  ? "✓ Current"
                  : "🔒 Locked"
              }

            </span>

          </div>

        `

      ).join("");

  }


  $$("[data-wallet]")
    .forEach(

      element => {

        element.textContent =
          "৳0";

      }

    );

}


/* =========================
   AUTH MESSAGE
========================= */

function authMsg(text) {

  const element =
    $("#authMessage");

  if (element) {

    element.textContent =
      text;

  }

}


/* =========================
   LOGIN / REGISTER
========================= */

function initAuthForms() {

  const loginForm =
    $("#loginForm");


  if (loginForm) {

    loginForm.addEventListener(

      "submit",

      async event => {

        event.preventDefault();

        try {

          await signInWithEmailAndPassword(

            auth,

            $("#email").value.trim(),

            $("#password").value

          );

          location.href =
            "index.html";

        }

        catch (error) {

          authMsg(
            error.message
          );

        }

      }

    );

  }


  const registerForm =
    $("#registerForm");


  if (registerForm) {

    registerForm.addEventListener(

      "submit",

      async event => {

        event.preventDefault();

        try {

          const credential =
            await createUserWithEmailAndPassword(

              auth,

              $("#email").value.trim(),

              $("#password").value

            );


          await updateProfile(

            credential.user,

            {

              displayName:
                $("#name").value.trim()

            }

          );


          await saveProfile(
            credential.user
          );


          location.href =
            "index.html";

        }

        catch (error) {

          authMsg(
            error.message
          );

        }

      }

    );

  }


  const google =
    $("#googleLogin");


  if (google) {

    google.addEventListener(

      "click",

      async () => {

        try {

          const credential =
            await signInWithPopup(

              auth,

              new GoogleAuthProvider()

            );


          await saveProfile(
            credential.user
          );


          location.href =
            "index.html";

        }

        catch (error) {

          authMsg(
            error.message
          );

        }

      }

    );

  }

}


/* =========================
   MY ORDERS
========================= */

async function renderOrders(user) {

  const box =
    $("#ordersList");


  if (!box) return;


  if (!user) {

    box.innerHTML = `

      <div class="order-card">

        <h3>
          Login required
        </h3>

        <p class="muted">
          Please login to see your orders.
        </p>

        <a
          class="btn primary"
          href="login.html"
        >
          Login
        </a>

      </div>

    `;

    return;

  }


  try {

    const snapshot =
      await getDocs(

        query(

          collection(db, "orders"),

          where(
            "userId",
            "==",
            user.uid
          )

        )

      );


    if (snapshot.empty) {

      box.innerHTML = `

        <div
          class="order-card"
          style="text-align:center"
        >

          <div style="font-size:48px">
            📦
          </div>

          <h3>
            No order data found!
          </h3>

          <a
            class="btn primary"
            href="product.html"
          >
            ORDER NOW
          </a>

        </div>

      `;

      return;

    }


    const orders = [];


    snapshot.forEach(

      document => {

        orders.push({

          id: document.id,

          ...document.data()

        });

      }

    );


    orders.sort(

      (a, b) =>

        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)

    );


    box.innerHTML =

      orders.map(

        order => `

          <article class="order-card">

            <div class="order-card-top">

              <div>

                <h3>
                  ${esc(
                    order.productName ||
                    "Top Up"
                  )}
                </h3>

                <span class="order-id">
                  #${esc(order.id)}
                </span>

              </div>

              <span
                class="
                  order-status
                  status-${String(
                    order.status ||
                    "pending"
                  ).toLowerCase()}
                "
              >

                ${esc(
                  order.status ||
                  "pending"
                )}

              </span>

            </div>


            <div class="order-card-info">

              <div>

                <small>
                  Amount
                </small>

                <strong>
                  ${money(order.amount)}
                </strong>

              </div>


              <div>

                <small>
                  Game UID
                </small>

                <strong>
                  ${esc(
                    order.gameUid ||
                    "-"
                  )}
                </strong>

              </div>

            </div>

          </article>

        `

      ).join("");

  }

  catch (error) {

    box.innerHTML = `

      <div class="order-card">

        <h3>
          Could not load orders
        </h3>

        <p class="muted">
          ${esc(error.message)}
        </p>

      </div>

    `;

  }

}


/* =========================
   PRODUCTS
========================= */

function renderProducts(filter = "all") {

  const box =
    $("#products");


  if (!box) return;


  const list =
    filter === "all"

      ? PRODUCTS

      : PRODUCTS.filter(
          item =>
            item.cat === filter
        );


  box.innerHTML =

    list.map(

      product => `

        <article class="product-card">

          <div class="product-icon">

            ${product.icon}

          </div>

          <h3>
            ${esc(product.name)}
          </h3>

          <p>
            ${esc(product.detail)}
          </p>

          <div class="product-price">

            ${money(product.price)}

          </div>

          <button
            class="btn primary buy"
            data-id="${product.id}"
          >
            Buy Now
          </button>

        </article>

      `

    ).join("");


  $$(".buy").forEach(

    button => {

      button.onclick = () => {

        selectProduct(
          button.dataset.id
        );

      };

    }

  );

}


/* =========================
   SELECT PRODUCT
========================= */

function selectProduct(id) {

  const product =
    PRODUCTS.find(
      item => item.id === id
    );


  if (!product) return;


  $("#selectedProductId").value =
    product.id;


  $("#selectedProductName")
    .textContent =
      product.name;


  $("#selectedProductPrice")
    .textContent =
      money(product.price);


  $("#checkout")
    .classList
    .remove("hidden");


  $("#checkout")
    .scrollIntoView({
      behavior:"smooth"
    });

}


/* =========================
   PRODUCT PAGE
========================= */

function initProducts() {

  if (!$("#products")) return;


  renderProducts("all");


  $$(".category-tabs button")
    .forEach(

      button => {

        button.onclick = () => {

          $$(".category-tabs button")
            .forEach(
              item =>
                item.classList
                  .remove("selected")
            );


          button.classList
            .add("selected");


          renderProducts(
            button.dataset.filter
          );

        };

      }

    );


  const params =
    new URLSearchParams(
      location.search
    );


  const category =
    params.get("category");


  if (category) {

    const button =
      document.querySelector(
        `[data-filter="${category}"]`
      );


    if (button) {

      button.click();

    }

  }


  const form =
    $("#orderForm");


  if (!form) return;


  form.addEventListener(

    "submit",

    async event => {

      event.preventDefault();


      const user =
        auth.currentUser;


      if (!user) {

        location.href =
          "login.html";

        return;

      }


      const product =
        PRODUCTS.find(

          item =>
            item.id ===
            $("#selectedProductId").value

        );


      const gameUid =
        $("#gameUid")
          .value
          .trim();


      if (!product || !gameUid) {

        return;

      }


      try {

        await addDoc(

          collection(
            db,
            "orders"
          ),

          {

            userId:
              user.uid,

            userEmail:
              user.email || "",

            gameUid:
              gameUid,

            productId:
              product.id,

            productName:
              product.name,

            amount:
              product.price,

            status:
              "pending",

            createdAt:
              serverTimestamp()

          }

        );


        alert(
          "Order placed successfully!"
        );


        location.href =
          "orders.html";

      }

      catch (error) {

        alert(
          error.message
        );

      }

    }

  );

}


/* =========================
   APP START
========================= */

document.addEventListener(

  "DOMContentLoaded",

  () => {

    initAuthForms();

    initProducts();


    const logout =
      $("#logoutBtn");


    if (logout) {

      logout.onclick =
        async () => {

          await signOut(auth);

          location.href =
            "index.html";

        };

    }


    $$("[data-account]")
      .forEach(

        button => {

          button.onclick = () => {

            location.href =
              auth.currentUser
                ? "account.html"
                : "login.html";

          };

        }

      );


    onAuthStateChanged(

      auth,

      async user => {

        if (user) {

          await saveProfile(user);

          await renderUser(user);

          await renderOrders(user);

        }

        else {

          await renderOrders(null);


          if (
            location.pathname
              .endsWith("account.html")
          ) {

            location.href =
              "login.html";

          }

        }

      }

    );

  }

);