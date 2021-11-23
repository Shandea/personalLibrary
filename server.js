'use strict';

const express = require('express');
const app = express();
require('dotenv').config();
const helmet = require('helmet');


// Set view engine to use pug
app.set('view engine', 'pug');
const mongoose = require('mongoose');

// Connect mongoose
mongoose.connect(process.env.REMOTE_DB, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, () => console.log("db connected"))
// Require BookModel File
const BookModel = require('./models/BookModel');
// Require CommentModel file
const CommentModel = require('./models/CommentModel');

app.use('/public', express.static(process.cwd() + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));

// Get request for books and comments
app.route('/')
  .get(function (req, res) {
    BookModel.find({}, (err, data) => {
      if (err) {
        console.log(err);
        res.json({ error: err })
      } else {
        CommentModel.find({}, (err, commentdata) => {
          if (err) {
            res.json({ error: err })
          } else {
            let content = data.map(book => {
              let obj = {
                id: book._id,
                title: book.title,
                comments: commentdata.filter(comment => comment.reference == book.title)
                  .map(comment => comment.text)
              }
              return obj
            })
            console.log(content);
            res.render(process.cwd() + '/views/index.pug', { books: content });
          }
        })
      }
    })
  });


// Post request for books
app.post('/api/books', (req, res) => {
  console.log(req.body.bookTitle)
  const NewBook = new BookModel({
    title: req.body.bookTitle
  })
  NewBook.save((err, data) => {
    if (err) {
      res.json({ "message": err })
    } else {
      console.log(data)
      res.redirect('/')
    }
  })
})

// Post request for Comments and Book Title
app.post('/api/books/comment', (req, res) => {
  BookModel.find({ title: req.body.bookid }, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data)
      if (data == undefined) {
        res.json({ message: "No Book Exists" })
      } else {
        const NewComment = new CommentModel({
          text: req.body.comment,
          reference: req.body.bookid
        })
        NewComment.save((err, done) => {
          if (err) {
            res.json({ "error": err })
          } else {
            res.redirect('/')
          }
        })
      }
    }
  })
})

// Delete Book and Comment
app.get('/api/delete/:bookToDelete', (req, res) => {
  let theBook = req.params.bookToDelete;
  BookModel.findByIdAndDelete({ _id: theBook }, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data.title)
      let theComment = req.params.reference;
      CommentModel.deleteMany({ reference: data.title }, (err, comm) => { // findbyidand delete only works on id
        if (err) {
          res.json({ "error": err })
        } else {
          console.log(comm);
          res.redirect('/')
        }
      })
    }
  })
})

// Delete All Books from Database
app.post('./api/deleteAll', (req, res) => {
  BookModel.remove({}, (err, data) => {
    if (err) {
      res.json({ "error": err })
    } else {
      console.log(data)
      CommentModel.remove({}, (err, comm) => {
        if (err) {
          res.json({ "error": err })
        } else {
          res.redirect('/')
        }
      })
    }
  })
})


//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        //runner.run();
      } catch (e) {
        let error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
