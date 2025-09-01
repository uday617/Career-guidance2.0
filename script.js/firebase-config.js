const firebaseConfig = {
  apiKey: "AIzaSyD1XAOqIDzTrtr4PMT2bnOSlgrni4Wb__k",
  authDomain: "career-guidance-5d721.firebaseapp.com",
  projectId: "career-guidance-5d721",
  storageBucket: "career-guidance-5d721.firebasestorage.app",
  messagingSenderId: "479290767363",
  appId: "1:479290767363:web:47977130c4d62eaa10b636",
  measurementId: "G-0KCJRVC62H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//  Make Auth & Firestore available globally
window.auth = firebase.auth();
window.db = firebase.firestore();

