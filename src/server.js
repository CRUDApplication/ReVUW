require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const initialiseDb = require(path.join(__dirname, 'utils', 'database'));
const passportSetup = require(path.join(__dirname, 'utils', 'passport-setup'));
const API_URL = process.env.API_URL || 'http://localhost:3001';
const ReviewModel = require(path.join(__dirname, 'models', 'review'));
const axios = require('axios');


const app = express();

// Connect to database
initialiseDb();

// Set up view engine and views directory
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/css', express.static(path.join(__dirname, '../node_modules', 'bootstrap', 'dist', 'css'))); 
app.use('/icons', express.static(path.join(__dirname, '../node_modules', 'bootstrap-icons', 'font'))); 
app.use('/js', express.static(path.join(__dirname, '../node_modules', 'bootstrap', 'dist', 'js')));
app.use('/fonts', express.static(path.join(__dirname, '../public', 'fonts')));
app.use('/images', express.static(path.join(__dirname, '../public', 'images')));

// Parse incoming request bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Set up sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI,
        ttl: 60 * 60 // 1 hour
    }),
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'lax',
        secure: false
    }
}));

// Initialize Passport and session for Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    next();
});

app.use(flash());
// Define routes
const authRoutes = require('./routes/auth'); 
app.use('/auth', authRoutes.router);
app.use('/courses', require('./routes/courses'));


// Root route
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${API_URL}/allcourses`);
        const courses = response.data;

        const coursesWithRatings = [];

        for (const course of courses) {
            const { courseCode } = course;

            const reviews = await ReviewModel.find({ courseCode}).populate('userId');
            let totalRating = reviews.reduce((sum, review) => {
                return sum + (isNaN(review.rating) ? 0 : review.rating);
            }, 0);

            let averageRating = totalRating / reviews.length;

            const courseWithRating = {
                ...course,
                averageRating: !isNaN(averageRating) ? averageRating.toFixed(1) : 0,
            }
            coursesWithRatings.push(courseWithRating);
        }

        // sorting courses by highest rating
        coursesWithRatings.sort((a, b) => b.averageRating - a.averageRating);
        res.render('index', { courses: coursesWithRatings.slice(0, 3), title: 'ReVUW | Home', user: req.user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve courses' });
    }
});

// Add routes for About Us, Contact, and Privacy Policy
app.get('/about', (req, res) => {
    
    res.render('about', { title: 'ReVUW | About Us', user: req.user });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'ReVUW | Contact', user: req.user });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { title: 'ReVUW | Privacy Policy', user: req.user });
});

module.exports = app;
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
