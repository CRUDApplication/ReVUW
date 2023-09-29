const express = require('express');
const path = require('path');
const CourseModel = require(path.join(__dirname, '..', 'models', 'course'));

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
        const courses = await CourseModel.find({ courseCode: courseCode });
        res.render('courses', { courses, title: 'ReVUW | Courses', user: req.session.user });

        if (!courses) {
            return res.status(404).json({ error: 'Course not found'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve course'});
    }
});

module.exports = router;