'use strict';
require('dotenv').config();
require('ejs');
const { Console } = require('console');
const express = require('express');
const superagent = require('superagent');
const app = express();
let PORT = process.env.PORT || 3338;
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', renderHomePage);
app.get('/searches/new', getNew);
app.post('/searches', postSearch);
app.post('/books', addSingleBook);
app.get('/book/:id', getSingleBook);

//const url = 'https://www.googleapis.com/books/v1/volumes?q=Dune';

function addSingleBook(req, res) {
    console.log(req.params, "params");
}
function getSingleBook(req, res) {
    // :id can be found at req.params.id
    //render a single task
    console.log(req.params, "params");
    const sqlString = 'SELECT * FROM book WHERE ID = $1';
    const sqlArray = [req.params.id];
    client.query(sqlString, sqlArray).then(result => {
        const book = result.rows[0];
        let ejObject = { book };
        //console.log(result.row)
        res.render('pages/details.ejs', ejObject);
    });
    //res.render('pages/single_tasks.ejs')
}
function renderHomePage(req, res) {
    // console.log("hello");
    // console.log(req.body);
    const sqlString = `SELECT * FROM book`;
    client.query(sqlString).then(result => {
        console.log(result.rows);
        const ejsObject = { allBooks: result.rows };
        console.log(ejsObject);
        res.render('pages/index.ejs', ejsObject);
    });
    // res.render('pages/index.ejs', {});
}
//Map over the array of results, creating a new Book instance from each result object.
function postSearch(req, res) {
    //console.log(req.body.search);
    //console.log(req.body.search_radio);
    const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search_radio}:${req.body.search}`;
    superagent.get(url).then(bookDataReturned => {
        const bookArray = bookDataReturned.body.items.map((item) => new Books(item));
        res.render(`pages/searches/show.ejs`, { bookArray: bookArray });
        //res.redirect('/students');
        console.log(bookArray[0]);
    });
}

function getNew(req, res) {
    res.render('pages/searches/new.ejs', {});
}




//bookData.volumenInfo {title, author}
function Books(bookData) {
    const placeHolder = `https://i.imgur.com/J5LVHEL.jpg`;
    const bookImg = (bookData.volumeInfo.imageLinks !== undefined) ? bookData.volumeInfo.imageLinks.thumbnail : placeHolder;
    this.title = bookData.volumeInfo.title;
    this.isbn = bookData.volumeInfo.industryIdentifiers[0].type + " " + bookData.volumeInfo.industryIdentifiers[0].identifier;
    this.author = bookData.volumeInfo.authors;
    this.overview = bookData.volumeInfo.description;
    this.image = bookImg;
    // this.image = bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`; //`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
}

client.connect().then(() => {
    app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
});


