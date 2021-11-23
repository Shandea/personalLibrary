const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const BookSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    }
})

// Create Book Model
const BookModel = mongoose.model('book', BookSchema);
module.exports = BookModel