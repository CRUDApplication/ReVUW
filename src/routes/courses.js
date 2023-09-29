const express = require('express');
const path = require('path');
const CourseModel = require(path.join(__dirname, '..', 'models', 'course'));
const ReviewModel = require(path.join(__dirname, '..', 'models', 'review'));

const router = express.Router();

router.get('/allcourses', async (req, res) => {
    try {
        const courses = await CourseModel.find();
        res.render('courses', { courses, title: 'ReVUW | Courses', user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve courses'});
    }
});

router.get('/:courseCode', async (req, res) => {
    try {
        const courseCode = req.params.courseCode;
        const course = await CourseModel.findOne({ courseCode: courseCode });

        if (!course) {
            return res.status(404).json({ error: 'Course not found'});
        }
        
        const reviews = await ReviewModel.find({ courseCode: courseCode }).populate('userId');

        res.render('course', { course, reviews, title: 'ReVUW | ' + course.courseName, user: req.user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve course'});
    }
});

router.post('/:courseCode/review', async (req, res) => {
    try {
        if(!req.user || !req.user._id) {
            return res.redirect('/login');
        }

        userId = req.user._id;

        const review = new ReviewModel({
            courseCode: req.params.courseCode,
            content: req.body.reviewContent,
            userId: userId,
            datePosted: new Date()
        });

        await review.save();

        res.redirect(`/courses/${req.params.courseCode}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to post review' });
    }
});

module.exports = router;