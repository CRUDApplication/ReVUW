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

// Parse incoming request bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Set up sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        maxAge: 6000000 * 60 * 24, // 1 day
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
app.use('/auth', require('./routes/auth'));
app.use('/courses', require('./routes/courses'));


// Root route
app.get('/', (req, res) => {
    res.render('index', { title: 'ReVUW | Home', user: req.session.user });
});

app.get('/signin', (req, res) => {
    const errorMessage = req.flash('error');
    res.render('signin', { errorMessage: errorMessage[0], title: 'ReVUW | Login', user: req.session.user, activeTab: 'login' });
});

// Add routes for About Us, Contact, and Privacy Policy
app.get('/about', (req, res) => {
    res.render('about', { title: 'ReVUW | About Us', user: req.session.user });
});

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'ReVUW | Contact', user: req.session.user });
});

app.get('/privacy', (req, res) => {
    res.render('privacy', { title: 'ReVUW | Privacy Policy', user: req.session.user });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
