export const renderStars = (rate) => {
  let stars = Number(rate);

  if (isNaN(stars) || !stars) return "Unrated";

  return Array.from({ length: stars }, () => "&#9733;").join("");
};

export const bookCardTemplate = ({
  id,
  title,
  author,
  genre,
  rate,
}) => /* html */ `
  <article class="book-card">
    <div>
      <h3 class="book-title">${title}</h3>
      <p class="book-author">
        <strong>Author:</strong>
        ${author}
      </p>
      <p class="book-genre">
        <strong>Genre:</strong>
        ${genre}
      </p>
      <p class="book-rate">
        <strong>Rating:</strong>
        ${renderStars(rate)}
      </p>
    </div>
    <div class="book-control">
      <button data-roll="edit" data-book-id="${id}" class="btn btn--success">Edit</button>
      <button data-roll="delete" data-book-id="${id}" class="btn btn--danger">Delete</button>
    </div>
  </article>
`;

export const sanitizeInput = (input) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  return doc.body.textContent || "";
};
