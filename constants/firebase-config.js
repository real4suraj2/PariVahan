import * as firebase from "firebase";

var firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
export const db = firebase.database();
