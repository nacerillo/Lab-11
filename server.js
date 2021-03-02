'use strict';
require('dotenv').config();
require('ejs');
const { Console } = require('console');
const express = require('express');
const superagent = require('superagent');
const app = express();
let port = process.env.PORT;
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', renderHomePage);
app.get('/searches/new', getNew);
app.post('/searches', postSearch);
//const url = 'https://www.googleapis.com/books/v1/volumes?q=Dune';


function renderHomePage(req, res) {
    res.render('pages/index.ejs', {});
}
//Map over the array of results, creating a new Book instance from each result object.
function postSearch(req, res) {
    console.log(req.body.search);
    console.log(req.body.search_radio);
    const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.search_radio}:${req.body.search}`;
    superagent.get(url).then(bookDataReturned => {
        const bookArray = bookDataReturned.body.items.map((item) => new Books(item));
        res.render(`pages/searches/show.ejs`, { bookArray: bookArray });
        //res.redirect('/students');
    });
}

function getNew(req, res) {
    res.render('pages/searches/new.ejs', {});
}


app.listen(port, () => {
    console.log('Server is listening on port', port);
});

//bookData.volumenInfo {title, author}
function Books(bookData) {
    const placeHolder = `https://i.imgur.com/J5LVHEL.jpg`;
    const bookImg = (bookData.volumeInfo.imageLinks !== undefined) ? bookData.volumeInfo.imageLinks.thumbnail : placeHolder;
    //console.log(bookData.volumeInfo.imageLinks.smallThumbnail);
    this.title = bookData.volumeInfo.title;
    this.author = bookData.volumeInfo.authors;
    this.overview = bookData.volumeInfo.description;
    this.image = bookImg;
    // this.image = bookData.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`; //`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
}

