// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfiqHTb3sGk1e7cfPyVeOoXsDJsm2Gbeo",
  authDomain: "water-price-top-up-bd.firebaseapp.com",
  projectId: "water-price-top-up-bd",
  storageBucket: "water-price-top-up-bd.firebasestorage.app",
  messagingSenderId: "759484315438",
  appId: "1:759484315438:web:0630e5c17673b214526cbf",
  measurementId: "G-8252E0PJPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);