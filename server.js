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
//app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
//details action method for delete /books/:id?_method=DELETE
app.get('/', renderHomePage);
app.get('/searches/new', getNew);
app.post('/searches', postSearch);
app.post('/books', addSingleBook);
app.get('/book/:id', getSingleBook);
//app.get('/books/:id',deleteBook);
//app.get('/books/:id',updateBook);
//  app.post('/books')
// getData from DB


/*function updateBook(req,res){
    /go get a book from DB, who's id = req.params.id
    //pass book into ejs file as an object

}*/
/*function deleteBook(req,res){
      //get id = req.params.id
    //run delete query with that Id
    // redirect them elsewhere
}*/
function addSingleBook(req, res) {
    //(author,title,isbn,image_url,description) 
    const sqlString = 'INSERT INTO book (author, title, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) returning *';
    const sqlArray = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];
    //console.log(sqlArray);

    client.query(sqlString, sqlArray).then(result => {
        const book = result.rows[0];
        console.log(book);
        // let ejObject = { book };
        res.redirect(`/book/${book.id}`);
    });
    // console.log(req.body, "params");

}
function getSingleBook(req, res) {
    // :id can be found at req.params.id
    //render a single task
    //  console.log(req.params, "params");
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
        //   console.log(result.rows);
        const ejsObject = { allBooks: result.rows };
        //  console.log(ejsObject);
        res.render('pages/index.ejs', ejsObject);
    });
    // res.render('pages/index.ejs', {});
}
//Map over the array of results, creating a new Book instance from each result object.
function postSearch(req, res) {
    //console.log(req.body.search);
    console.log(req.body.search_radio);
    const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search_radio}:${req.body.search}`;
    superagent.get(url).then(bookDataReturned => {
        // console.log(bookDataReturned.body.items, "INFO");
        const bookArray = bookDataReturned.body.items.map((item) => new Books(item));
        res.render(`pages/searches/show.ejs`, { bookArray: bookArray });
        //res.redirect('/students');
        //console.log(bookArray[0]);
    });
}

function getNew(req, res) {
    res.render('pages/searches/new.ejs', {});
}




//bookData.volumenInfo {title, author}
function Books(bookData) {
    console.log(bookData);
    const placeHolder = `https://i.imgur.com/J5LVHEL.jpg`;
    const fakeISBN = "N/A";
    this.isbn = (bookData.volumeInfo.industryIdentifiers !== undefined) ? bookData.volumeInfo.industryIdentifiers[0].type + " " + bookData.volumeInfo.industryIdentifiers[0].identifier : fakeISBN;
    const bookImg = (bookData.volumeInfo.imageLinks !== undefined) ? bookData.volumeInfo.imageLinks.thumbnail : placeHolder;
    this.title = bookData.volumeInfo.title;

    this.author = bookData.volumeInfo.authors;
    this.overview = bookData.volumeInfo.description;
    this.image = bookImg;
    // this.image = bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`; //`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
}

client.connect().then(() => {
    app.listen(PORT, () => console.log(`app is up on port http://localhost:${PORT}`));
});


//heroku pg:push books_app DATABASE_URL --app book-app-nacerillo