const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: String,
    title: String,
    description: String,
    lecturers: String,
    tags: String
});

const CourseModel = mongoose.model('Course', courseSchema);

module.exports = CourseModel;