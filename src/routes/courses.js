const express = require('express');
const path = require('path');
const CourseModel = require(path.join(__dirname, '..', 'models', 'course'));
const ReviewModel = require(path.join(__dirname, '..', 'models', 'review'));
const isAuthenticated = require('../middleware/isAuthenticated');

const router = express.Router();

// Course routes
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


// Review routes

// Middleware to check review ownership
const checkReviewOwnership = async (req, res, next) => {
    try {
        const review = await ReviewModel.findById(req.params.reviewId);
        if (review && req.user && review.userId.toString() === req.user._id.toString()) {
            next();
        } else {
            res.redirect(`/courses/${req.params.courseCode}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify review ownership' });
    }
};

router.post('/:courseCode/review', isAuthenticated, async (req, res) => {
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

// Edit form route
router.get('/:courseCode/reviews/:reviewId/edit', checkReviewOwnership, async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.reviewId);
        res.render('editReview', { review, courseCode: req.params.courseCode, user: req.user, title: 'Edit Review' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve review for editing' });
    }
});

// Update review route
router.post('/:courseCode/reviews/:reviewId/edit', checkReviewOwnership, async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.reviewId);
        review.content = req.body.reviewContent;
        await review.save();
        res.redirect(`/courses/${req.params.courseCode}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to edit review' });
    }
});

router.delete('/:courseCode/reviews/:reviewId', checkReviewOwnership, async (req, res) => {
    try {
        const review = await ReviewModel.findById(req.params.reviewId);
        
        if (!review) {
            res.status(404).json({ error: 'Review not found', success: false });
            return;
        }

        await review.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete review', success: false });
    }
});

module.exports = router;