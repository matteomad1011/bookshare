import firebase from 'firebase/app';
import 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBh0Gd7tzj820Wpvi33DcmuFzVpN8Nc4Bo",
    authDomain: "bookshare-4d2f4.firebaseapp.com",
    projectId: "bookshare-4d2f4",
    storageBucket: "bookshare-4d2f4.appspot.com",
    messagingSenderId: "194653713104",
    appId: "1:194653713104:web:76ef63326bff6118f3a4d5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const FBAuth = firebase.auth()
export const FBFirestore = firebase.firestore()
