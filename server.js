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

/*
if we want an app build around a resource: dog

app.get('/dogs'); // show page  with all dogs
app.get('/dog/1'); // show a page with 1 dog (dog 5
app.put('dog'): //add dog
app.put('/dog/5'): //add dog
app.delete('/dog/5') // delete dog 5

const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);


app.get('/tasks', getAllTasks);
app.get('/task/1', getSingleTask);
app.post('task', addTask);
app.put('/task/1',updateSingleTask);
app.delete('/tasks/1',deleteSingleTask);

function getAllTasks(res,req){

//Purpose: take all tasks from global variable
// render those tasks to the page
//const sqlString = `Select * FROM books;`

client.query() //takes in sql query string, and template array
.then(result => {
    console.log(results.rows);
    const ejsObjecr = {allTasks: results.rows};
    res.render('pages/show_tasks.ejs', allTasks);
});

}

function getSingleTask(res,req){
    //render a single task
    res.render('pages/single_tasks.ejs')
}
function addTask(res,req){
res.send('addTask');
//purpose: update a task
res.redirect('/task/1')
//LAB: show them the detailed view of the specific item that was added

}

function updateSingleTask(res,req){
res.send('updateSingleTask');

};

function deleteSingleTask(res,req){
res.send('deleteSingleTask')
purpose: delete a task, send them to the all tasks page
}

client.connect().then() => app.listen.....


*/