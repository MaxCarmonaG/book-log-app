import {
  authObserver,
  booksObserver,
  deleteBook,
  editBook,
  saveBook,
  signInWithGoogle,
  signOut,
} from "./lib/firebase";
import { bookCardTemplate, sanitizeInput } from "./lib/utils";
import {
  checkBiometricSupport,
  registerBiometric,
  verifyBiometric,
} from "./lib/biometrics";
import { askChatBot } from "./lib/genAI";

let data = [];

const inputIds = ["id", "title", "author", "genre", "rate"];
const form = document.getElementById("form-record");
const signInButton = document.getElementById("sign-in-button");
const chatInput = document.getElementById("chat-input");

const orderBy = (by) => {
  const sorted = data.sort((a, b) => {
    return a[by].localeCompare(b[by]);
  });
  renderLogger(sorted);
};

const handleEditBook = (id) => {
  const book = data.find((b) => b.id === id);
  inputIds.forEach((inputId) => {
    document.getElementById(inputId).value = sanitizeInput(book[inputId]);
  });
};

const addControlEvents = () => {
  const editButtons = document.querySelectorAll("[data-roll=edit]");
  editButtons.forEach((button) =>
    button.addEventListener("click", () =>
      handleEditBook(button.getAttribute("data-book-id"))
    )
  );

  const deleteButtons = document.querySelectorAll("[data-roll=delete]");
  deleteButtons.forEach((button) =>
    button.addEventListener("click", () =>
      deleteBook(button.getAttribute("data-book-id"))
    )
  );
};

const renderLogger = (books) => {
  data = [...books];
  const template = data.map((book) => bookCardTemplate(book)).join("");
  if (template) {
    const block = /* html */ `<div class="logger__grid">${template}</div>`;
    document.getElementById("logger").innerHTML = block;
    addControlEvents();
  } else {
    document.getElementById(
      "logger"
    ).innerHTML = /* html */ `<h3 class="logger__empty">Your log is empty</h3>`;
  }
};

const getInput = () =>
  inputIds.reduce((prev, curr) => {
    const val = document.getElementById(curr).value;
    return {
      ...prev,
      [curr]: sanitizeInput(val),
    };
  }, {});

const handleBlur = ({ value, name }) => {
  const errorMsg = document.querySelector(`[data-target=${name}]`);
  if (value && value.trim()) {
    if (errorMsg) {
      errorMsg.classList.add("error-msg--hidden");
    }
  } else {
    if (errorMsg) {
      errorMsg.classList.remove("error-msg--hidden");
    }
  }
};

const launchToast = (msg, type = "success") => {
  const toast = document.getElementById("snackbar");

  if (toast) {
    toast.innerText = msg;
    toast.classList.add(`show--${type}`);
    setTimeout(() => {
      toast.classList.remove(`show--${type}`);
    }, 3000);
  }
};

const validateForm = () => {
  const book = getInput();
  const errorInputs = [];

  for (const [key, value] of Object.entries(book)) {
    if (!value && key !== "id") {
      errorInputs.push(key);
    }
  }

  if (!errorInputs.length) {
    return book;
  }

  errorInputs.forEach((name) => {
    const errorMsg = document.querySelector(`[data-target=${name}]`);
    if (errorMsg) {
      errorMsg.classList.remove("error-msg--hidden");
    }
  });

  launchToast("Error: All fields are required", "danger");

  return null;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const book = validateForm();

  if (book) {
    if (book.id) {
      editBook(book, () => launchToast("Book edited successfully"));
    } else {
      saveBook(book, (id) => {
        document.getElementById("id").value = id;
        launchToast("Book saved successfully");
      });
    }
  }
};

const handleReset = () => {
  document.querySelector("input[type=hidden]").removeAttribute("value");
};

const handleSignIn = async () => {
  try {
    const user = await signInWithGoogle();

    if (!user) return launchToast("Error: sign in failed", "danger");

    if (!localStorage.getItem("credentialId")) {
      if (await checkBiometricSupport()) {
        if (window.confirm("Do you want to set up biometric?")) {
          await registerBiometric(user);
        }
      }
    } else {
      if (!(await verifyBiometric())) {
        await handleSignOut();
        launchToast("Error: Biometric verification failed", "danger");
      }
    }
  } catch (e) {
    console.error("Sign in failed:", e);
  }
};

const handleSignOut = async () => {
  await signOut();
  data = [];
};

const authGuard = (isLoggedIn) => {
  if (isLoggedIn) {
    signInButton.innerText = "Sign Out";
    signInButton.onclick = handleSignOut;
    signInButton.classList.replace("btn--success", "btn--danger");
    booksObserver(renderLogger);
  } else {
    signInButton.innerText = "Sign In";
    signInButton.onclick = handleSignIn;
    signInButton.classList.replace("btn--danger", "btn--success");
    document.getElementById(
      "logger"
    ).innerHTML = /* html */ `<p class="logger__empty">Please Login first to display Books history</p>`;
  }
};

const appendMessage = (message) => {
  const history = document.createElement("div");
  history.textContent = message;
  history.className = "history";
  document.getElementById("chat-history").appendChild(history);
  chatInput.value = "";
};

const handleAskChatBot = async () => {
  const prompt = chatInput.value.trim().toLowerCase();
  if (prompt) {
    const result = await askChatBot(prompt);
    appendMessage(result.response.text());
  } else {
    appendMessage("Please enter a prompt");
  }
};

const handleChatbotVisibility = () => {
  const chatbot = document.getElementById("chatbot-container");
  chatbot.classList.toggle("hidden");
};

const onInit = () => {
  authObserver(authGuard);
};

form.addEventListener(
  "blur",
  (e) => {
    if (e.target.matches("[type=text]")) {
      handleBlur(e.target);
    }
  },
  true
);

form.addEventListener("submit", handleSubmit);
form.addEventListener("reset", handleReset);

document
  .getElementById("order")
  .addEventListener("change", (e) => orderBy(e.target.value));

document.getElementById("send-btn").addEventListener("click", handleAskChatBot);
document
  .querySelectorAll(".chatbot-trigger")
  .forEach((btn) => btn.addEventListener("click", handleChatbotVisibility));

window.addEventListener("load", onInit);
