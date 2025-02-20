import { booksObserver, deleteBook, editBook, saveBook } from "./lib/firebase";
import { bookCardTemplate, sanitizeInput } from "./lib/utils";

let data = [];

const inputIds = ["id", "title", "author", "genre", "rate"];
const form = document.getElementById("form-record");

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
  document.getElementById("logger").innerHTML = template;
  addControlEvents();
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

const onInit = () => {
  booksObserver(renderLogger);
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

window.addEventListener("load", onInit);
