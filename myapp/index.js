const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  let myquery = `
    SELECT
        *
    FROM
        book
    WHERE
        book_id = ${bookId};`;

  const book = await db.get(myquery);

  response.send(book);
});

//adding book to data base
app.post("/books/", async (request, response) => {
  let bookDetails = request.body;
  //console.log(book_details);
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  //console.log(rating);
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const db_response = await db.run(addBookQuery);
  const book_added_book_id = db_response.lastID;
  response.send({ book_id: book_added_book_id });
});

//updating_database
app.put("/books/:bookid", async (request, response) => {
  let { bookid } = request.params;
  const bookDetails = request.body;
  //const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookid};`;
  const updated_book = await db.run(updateBookQuery);
  response.send("book updated");
});

//deleting book from data base
//http://localhost:3000/books/43/

app.delete("/books/:book_id", async (request, response) => {
  let { book_id } = request.params;

  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${book_id};`;
  let deleted_book = await db.run(deleteBookQuery);
  //response.send(deleted_book);
  response.send("book deleted_successfully");
});

//getting authors book
//http://localhost:3000/authors/1/books/
app.get("/authors/:authors_Id/books/", async (request, response) => {
  let { authors_Id } = request.params;

  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authors_Id};`;
  let author_books = await db.all(getAuthorBooksQuery);
  response.send(author_books);
});
