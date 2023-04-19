// Import the functions you need from the SDKs you need
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYFQtDExbn-h51_VcwsWWiLUGVqVCDpxM",
  authDomain: "nightclub-payment-tracking.firebaseapp.com",
  projectId: "nightclub-payment-tracking",
  storageBucket: "nightclub-payment-tracking.appspot.com",
  messagingSenderId: "522610216554",
  appId: "1:522610216554:web:1f53c4e010fc5da1890413",
  measurementId: "G-N87H332DQC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export default db;
