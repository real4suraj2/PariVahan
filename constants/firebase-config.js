import * as firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyBK5IE7QijEp3tZKSCYKb0tDpK5NrwjK_g",
  authDomain: "parivahan-1f4eb.firebaseapp.com",
  databaseURL: "https://parivahan-1f4eb.firebaseio.com",
  projectId: "parivahan-1f4eb",
  storageBucket: "parivahan-1f4eb.appspot.com",
  messagingSenderId: "567101954343",
  appId: "1:567101954343:web:e58ab32904b657a0257102",
  measurementId: "G-JXPNN6RKBH",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
export const db = firebase.database();
