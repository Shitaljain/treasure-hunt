// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwUErQ-KH5yEWUnNEnEWG8QbSH04bECFk",
  authDomain: "treasure-hunt-9c3fa.firebaseapp.com",
  databaseURL: "https://treasure-hunt-9c3fa-default-rtdb.firebaseio.com",
  projectId: "treasure-hunt-9c3fa",
  storageBucket: "treasure-hunt-9c3fa.firebasestorage.app",
  messagingSenderId: "75156229581",
  appId: "1:75156229581:web:261ef250ba70e92ea48884"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
var db = firebase.database();
var auth = firebase.auth();