const express = require('express');
const path = require('path');
const CourseModel = require(path.join(__dirname, '..', 'models', 'course'));

const router = express.Router();

router.get('/allcourses', async (req, res) => {
    try {
        const courses = await getAllCourses();
        res.render('courses', { courses });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve courses'});
    }
});

async function getAllCourses() {
    try {
        return await CourseModel.find();
    } catch (error) {
        console.error('Error retrieving courses:', error);
        throw error;
    }
}

router.get('/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const courses = await CourseModel.find({ name: name });
        res.render('courses', { courses });

        if (!courses) {
            return res.status(404).json({ error: 'Course not found'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve course'});
    }
});

module.exports = router;