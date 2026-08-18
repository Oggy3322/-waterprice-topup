import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfiqHTb3sGk1e7cfPyVeOoXsDJsm2Gbeo",
  authDomain: "water-price-top-up-bd.firebaseapp.com",
  projectId: "water-price-top-up-bd",
  storageBucket: "water-price-top-up-bd.firebasestorage.app",
  messagingSenderId: "759484315438",
  appId: "1:759484315438:web:0630e5c17673b214526cbf",
  measurementId: "G-8252E0PJPM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});