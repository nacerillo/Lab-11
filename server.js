"use strict";
require("dotenv").config();
require("ejs");

const express = require("express");
const superagent = require("superagent");
const app = express();
let PORT = process.env.PORT;
const pg = require("pg");
const methodOverride = require("method-override");

const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

client.on("error", (error) => console.log(error));

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
//details action method for delete /books/:id?_method=DELETE
app.get("/", renderHomePage);
app.get("/searches/new", getNew);
app.post("/searches", postSearch);
app.post("/books", addSingleBook);
app.get("/books/:id", getSingleBook);
//app.get('/books/:id', deleteBook);
app.put("/books/:id", updateBook);
app.get("/books/:id/edit", showEditableBook);

function showEditableBook(req, res) {
  const sqlString = "SELECT * FROM book WHERE ID = $1";
  const sqlArray = [req.params.id];
  client
    .query(sqlString, sqlArray)
    .then((result) => {
      const book = result.rows[0];
      let ejObject = { book };
      //console.log(result.row)
      res.render("pages/edit.ejs", ejObject);
    })
    .catch((err) => handleError(err, res));
  //res.render('pages/single_tasks.ejs')
}
//  app.post('/books')
// getData from DB
function updateBook(req, res) {
  const sqlString =
    "UPDATE book SET author=$2, title=$3, isbn=$4, image_url=$5, description=$6 WHERE id=$1 ";
  const sqlArray = [
    req.params.id,
    req.body.author,
    req.body.title,
    req.body.isbn,
    req.body.image_url,
    req.body.description,
  ];
  client.query(sqlString, sqlArray).then((result) => {
    console.log(result.rows[0], "resulting data");

    res.redirect(`/books/${result.rows[0].id}`);
  });

  console.log(req.body, "update is triggering");
}

function addSingleBook(req, res) {
  //(author,title,isbn,image_url,description)
  const sqlString =
    "INSERT INTO book (author, title, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) returning *";
  const sqlArray = [
    req.body.author,
    req.body.title,
    req.body.isbn,
    req.body.image_url,
    req.body.description,
  ];
  //console.log(sqlArray);
  client
    .query(sqlString, sqlArray)
    .then((result) => {
      const book = result.rows[0];
      console.log(book);
      // let ejObject = { book };
      res.redirect(`/books/${book.id}`);
    })
    .catch((err) => handleError(err, res));
  // console.log(req.body, "params");
}
function getSingleBook(req, res) {
  const sqlString = "SELECT * FROM book WHERE ID = $1";
  const sqlArray = [req.params.id];
  client
    .query(sqlString, sqlArray)
    .then((result) => {
      const book = result.rows[0];
      let ejObject = { book };
      //console.log(result.row)
      res.render("pages/details.ejs", ejObject);
    })
    .catch((err) => handleError(err, res));
  //res.render('pages/single_tasks.ejs')
}

function renderHomePage(req, res) {
  const sqlString = `SELECT * FROM book`;
  client
    .query(sqlString)
    .then((result) => {
      const ejsObject = { allBooks: result.rows };
      res.render("pages/index.ejs", ejsObject);
    })
    .catch((err) => handleError(err, res));
  // res.render('pages/index.ejs', {});
}

function postSearch(req, res) {
  //console.log(req.body.search_radio);
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search_radio}:${req.body.search}`;
  superagent
    .get(url)
    .then((bookDataReturned) => {
      const bookArray = bookDataReturned.body.items.map(
        (item) => new Books(item)
      );
      res.render(`pages/searches/show.ejs`, { bookArray: bookArray });
    })
    .catch((err) => handleError(err, res));
}

function getNew(req, res) {
  res
    .render("pages/searches/new.ejs", {})
    .catch((err) => handleError(err, res));
}

function handleError(err, res) {
  console.log("looks like something has gone wrong");
  console.log(err);
  res.render("pages/error.ejs", { err });
}

function Books(bookData) {
  console.log(bookData);
  const placeHolder = `https://i.imgur.com/J5LVHEL.jpg`;
  const fakeISBN = "N/A";
  this.isbn =
    bookData.volumeInfo.industryIdentifiers !== undefined
      ? bookData.volumeInfo.industryIdentifiers[0].type +
        " " +
        bookData.volumeInfo.industryIdentifiers[0].identifier
      : fakeISBN;
  const bookImg =
    bookData.volumeInfo.imageLinks !== undefined
      ? bookData.volumeInfo.imageLinks.thumbnail
      : placeHolder;
  this.title = bookData.volumeInfo.title;

  this.author = bookData.volumeInfo.authors;
  this.overview = bookData.volumeInfo.description;
  this.image = bookImg;
  // this.image = bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`; //`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
}

client.connect().then(() => {
  app.listen(PORT, () =>
    console.log(`app is up on port http://localhost:${PORT}`)
  );
});

//heroku pg:push books_app DATABASE_URL --app book-app-nacerillo
