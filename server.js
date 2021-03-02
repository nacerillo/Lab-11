'use strict';
require('dotenv').config();
require('ejs');
const express = require('express');
const superagent = require('superagent');
const app = express();
let port = process.env.PORT;
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', renderHomePage);
app.get('/searches/new', getNew);
app.get('/searches', postSearch);
const booksArr = [];
//const url = 'https://www.googleapis.com/books/v1/volumes?q=Dune';


function renderHomePage(req, res) {
    res.render('pages/index.ejs', {});
}
//Map over the array of results, creating a new Book instance from each result object.
function postSearch(req, res) {
    console.log(req.body);
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:Dune`;
    superagent.get(url).then(bookDataReturned => {
        const output = bookDataReturned.body.items.map((item) => new Books(item), 0);
        // const sliced = output.slice(10);
        console.log(output);
        res.json(output);
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
    this.title = bookData.volumeInfo.title || "Dune";//jsonData.title;
    this.author = bookData.volumeInfo.authors[0] || "Author";
    this.overview = bookData.volumeInfo.overview || "A book about a space drugs, giant space worms, an a boy that basically becomes god"; //jsonData.overview;
    this.image_url = bookData.volumeInfo.image || `https://i.imgur.com/J5LVHEL.jpg`; //`https://www.themoviedb.org/t/p/w600_and_h900_bestv2${jsonData.poster_path}` || 'sorry no image';
}