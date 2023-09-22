require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const passportSetup = require(path.join(__dirname, 'utils', 'passport-setup'));

const app = express();

// Set up view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies (for form data)
app.use(express.urlencoded({ extended: false }));

// Set up sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize Passport and session for Passport
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use('/auth', require('./routes/auth'));

// Ensure authenticated middleware for protected routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'ReVUW' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
