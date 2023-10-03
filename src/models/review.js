const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
    courseCode: String,
    content: String,
    rating: Number,
    userId: {
        type: Schema.Types.ObjectId, // This is the auto generated ObjectId from MongoDB
        ref: 'User'
    },
    datePosted: Date
});

module.exports = mongoose.model('Review', reviewSchema);
