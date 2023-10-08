const express = require('express');
const path = require('path');
const CourseModel = require(path.join(__dirname, '..', 'models', 'course'));
const ReviewModel = require(path.join(__dirname, '..', 'models', 'review'));
const User = require(path.join(__dirname, '..', 'models', 'user'));
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
            rating: req.body.rating,
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
        review.rating = req.body.rating;

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

// Save course routes

// Adds or removes from saved courses
router.post('/:courseCode/toggleSavedCourses', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        const courseCode = req.params.courseCode;
        const course = await CourseModel.findOne({ courseCode: courseCode });

        if (!user) {
            return res.status(404).send('cli: User not found in saved courses');
        }
        const courseId = course._id.toString();

        if (user.savedCourses.map(id => id.toString()).includes(courseId)) { // Removes from savedCourses
            const index = user.savedCourses.map(id => id.toString()).indexOf(courseId);
            user.savedCourses.splice(index, 1);
            await user.save();
        }
        else { // Adds to savedCourses
            user.savedCourses.push(course);
            await user.save();
        }
        res.send({message: 'Added to saved'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle saved courses', success: false });
    }
});

// Returns boolean whether course is in users saved courses
router.get('/:courseCode/isSavedCourse', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        const course = await CourseModel.findOne({ courseCode: req.params.courseCode });
        if (!course || !user) {
            return res.status(404).send('Course/user not found');
        }

        const isSavedCourse = user.savedCourses.map(id => id.toString()).includes(course._id.toString());
        res.send({ isSavedCourse });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to find saved courses', success: false });
    }
});

// Returns all saved courses for user
router.get('/allSavedCourses', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        res.send(user.savedCourses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to return all saved courses', success: false });
    }
});

module.exports = router;