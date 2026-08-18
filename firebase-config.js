// firebase-config.js

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyCfiqHTb3sGk1e7cfPyVeOoXsDJsm2Gbeo",

  authDomain:
    "water-price-top-up-bd.firebaseapp.com",

  projectId:
    "water-price-top-up-bd",

  storageBucket:
    "water-price-top-up-bd.firebasestorage.app",

  messagingSenderId:
    "759484315438",

  appId:
    "1:759484315438:web:0630e5c17673b214526cbf",

  measurementId:
    "G-8252E0PJPM"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
  initializeApp(firebaseConfig);


// =====================================================
// AUTHENTICATION
// =====================================================

const auth =
  getAuth(app);


// =====================================================
// FIRESTORE
// =====================================================

const db =
  getFirestore(app);


// =====================================================
// EXPORT
// =====================================================

export {
  app,
  auth,
  db
};