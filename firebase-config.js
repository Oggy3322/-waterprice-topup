import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };