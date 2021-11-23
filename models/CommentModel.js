const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Book Schema
const CommentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    reference:{
        type: String,
        required: true
        
    }
})

// Create Book Model
const CommentModel = mongoose.model('comment', CommentSchema);
module.exports = CommentModel