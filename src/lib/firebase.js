// Import the functions you need from the SDKs you need - note that this code will be bundled for the client
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3VbFqqXaa12mTgYEQOkYP4Ws4pdXIhfc",
  authDomain: "stripe-react-6db90.firebaseapp.com",
  projectId: "stripe-react-6db90",
  storageBucket: "stripe-react-6db90.appspot.com",
  messagingSenderId: "1095990194653",
  appId: "1:1095990194653:web:2d3af360263b97ec74c634",
};

// Initialize Firebase - this checks prevents multiple firebase instances from initializing
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export const firestore = firebase.firestore();
