import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {
  doc,
  addDoc,
  getFirestore,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  where,
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
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const bookRef = collection(db, "books");

export const saveBook = async ({ title, author, genre, rate }, callback) => {
  const user = auth.currentUser;

  if (!user) return;

  try {
    const doc = await addDoc(bookRef, {
      title,
      author,
      genre,
      rate,
      user: user.email,
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
  const user = auth.currentUser;

  if (!user) return;

  try {
    await setDoc(doc(db, "books", id), {
      title,
      author,
      genre,
      rate,
      user: user.email,
    });
    typeof callback === "function" && callback();
  } catch (e) {
    console.error("Error", "Error editing book: " + e);
  }
};

export const deleteBook = async (id) => await deleteDoc(doc(db, "books", id));

export const booksObserver = (renderLogger) => {
  const email = auth?.currentUser?.email ?? "";

  const q = query(bookRef, where("user", "==", email));

  return onSnapshot(q, (snapshot) => {
    const books = [];

    snapshot.forEach((doc) => {
      books.push({ ...doc.data(), id: doc.id });
    });
    renderLogger(books);
  });
};

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    return auth.currentUser;
  } catch (e) {
    console.error(e.message);
  }
};

export const signOut = async () => auth.signOut();

export const authObserver = (callback) =>
  auth.onAuthStateChanged((user) => callback(!!user));
