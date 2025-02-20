import { bookCardTemplate, renderStars, sanitizeInput } from "../lib/utils";

describe("App testing", () => {
  test("should render stars", () => {
    const starts = renderStars("5");

    expect(starts).toBe("&#9733;&#9733;&#9733;&#9733;&#9733;");
  });

  test("should render book card template", () => {
    const book = {
      title: "My book",
      author: "Max C.",
      genre: "Fantasy",
      rate: "3",
    };

    const div = document.createElement("div");
    div.innerHTML = bookCardTemplate(book);

    const title = div.querySelector(".book-title").textContent;
    const author = div.querySelector(".book-author").textContent;
    const genre = div.querySelector(".book-genre").textContent;
    const rate = div.querySelector(".book-rate").textContent;

    expect(title).contain(book.title);
    expect(author).contain(book.author);
    expect(genre).contain(book.genre);
    expect(rate).contain("★★★");
  });

  test("should sanitize input", () => {
    const unsafeInput = `<script>alert("Hacked!");</script> Hello <b>World</b>!`;
    const safeInput = sanitizeInput(unsafeInput);

    expect(safeInput).toBe("Hello World!");
  });
});
