// Konfigurasi Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc,
  updateDoc, increment, collection,
  addDoc, query, orderBy, limit,
  onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBd54K4gt0NaEfcf_E43wZVqnjM7Mi6GAA",
  authDomain: "nomor-surat-pkm.firebasestorage.app",
  projectId: "nomor-surat-pkm",
  storageBucket: "nomor-surat-pkm.firebasestorage.app",
  messagingSenderId: "825283193186",
  appId: "1:825283193186:web:683e6df9631fca4590a43b"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firebase services
export { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
};
