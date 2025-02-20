import { initializeApp } from "firebase/app";
import {
  doc,
  addDoc,
  getFirestore,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "book-log-6d30b.firebaseapp.com",
  projectId: "book-log-6d30b",
  storageBucket: "book-log-6d30b.firebasestorage.app",
  messagingSenderId: "1095825950181",
  appId: "1:1095825950181:web:86d5967124904e2f535b0c",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const bookRef = collection(db, "books");

export const saveBook = async ({ title, author, genre, rate }, callback) => {
  try {
    const doc = await addDoc(bookRef, {
      title,
      author,
      genre,
      rate,
    });
    typeof callback === "function" && callback(doc.id);
  } catch (e) {
    console.error("Error", "Error saving book: " + e);
  }
};

export const editBook = async (
  { id, title, author, genre, rate },
  callback
) => {
  try {
    await setDoc(doc(db, "books", id), {
      title,
      author,
      genre,
      rate,
    });
    typeof callback === "function" && callback();
  } catch (e) {
    console.error("Error", "Error editing book: " + e);
  }
};

export const deleteBook = async (id) => await deleteDoc(doc(db, "books", id));

export const booksObserver = (renderLogger) =>
  onSnapshot(bookRef, (snapshot) => {
    const books = [];
    snapshot.forEach((doc) => {
      books.push({ ...doc.data(), id: doc.id });
    });
    renderLogger(books);
  });
