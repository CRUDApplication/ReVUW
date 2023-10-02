const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user'));

const router = express.Router();

//Signup
router.get('/signup', (req, res) => {
  if(req.query.origin)
    req.session.returnTo = req.query.origin;
  else
    req.session.returnTo = req.header('Referer');
    
  res.render('signin', { title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: null, errorMessage: null, activeTab: 'register' });
});


router.post('/signup', async (req, res) => {
  const userPassword = req.body.registerPassword;
  const userEmail = req.body.email;
  let passwordCheckResult = checkPasswordStrength(userPassword);
  if (passwordCheckResult != null) {
    res.render('signin', { title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: passwordCheckResult, errorMessage: null, activeTab: 'register'});
  } 
  else {
    try {
      const emailIsUnique = await isEmailUnique(userEmail);
      if (!emailIsUnique) {
        res.render('signin', { title: 'ReVUW | SignUp', user: req.session.user, userEmail: req.body.email, errorMessage: 'Email already in use', activeTab: 'register'});
      } else {
        await User.create({ email: userEmail, password: userPassword });
        
        let returnTo = req.session.returnTo || '/';
        delete req.session.returnTo; // Cleanup session
        res.redirect(returnTo);
      }
    } catch (error) {
      res.render('signin', { passwordError: error.message,  errorMessage: null, title: 'Authentication Failed', user: req.user, activeTab: 'register' });
    }
  }
});


function checkPasswordStrength(userPassword) {
  let errorMessage = null;
  if (userPassword.length < 8) {
    errorMessage = 'Use 8 characters or more for your password';
  } else if (!/(?=.*[a-z])/.test(userPassword) || !/(?=.*[A-Z])/.test(userPassword) || !/[0-9]/.test(userPassword)) {
    errorMessage = 'Please choose a stronger password. Use a mix of numbers and letters with upper and lower case';
  } 
  return errorMessage;
}

/**
 * Check if the email is already in use by querying the database
 * @param {string} email 
 * @returns true if email is unique, false otherwise
 */
async function isEmailUnique(email) {
  try {
    const existingUser = await User.findOne({ email: email });
    return existingUser == null; // Return true if email is unique
  } catch (error) {
    console.log('Error while checking email uniqueness:', error);
    throw error; 
  }
}

router.get('/signin', (req, res, next) => {
  if( req.query.origin )
    req.session.returnTo = req.query.origin
  else
    req.session.returnTo = req.header('Referer')
  const errorMessage = req.flash('error');
  req.session.save(() => {
    res.render('signin', { passwordError: null, errorMessage: errorMessage[0], title: 'ReVUW | Login', user: req.session.user, activeTab: 'login' });
  });
});

router.post('/signin', storeRedirectInLocals, passport.authenticate('local', {
  failureRedirect: '/auth/signin',
  failureFlash: true
}), (req, res) => {
  let returnTo = res.locals.returnTo || '/'
  res.redirect(returnTo);
});

/**
 * Store the redirect URL in res.locals so it can be used later
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function storeRedirectInLocals(req, res, next) {
  res.locals.returnTo = req.session.returnTo;
  next();
}

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Google OAuth
router.get('/google', (req, res, next) => {
  const returnTo = req.session.returnTo || req.header('Referer');
  passport.authenticate('google', { 
      scope: ['profile', 'email'], 
      state: returnTo
  })(req, res, next);
});


router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), (req, res) => {
  let returnTo = req.query.state || '/';
  res.redirect(returnTo);
});


module.exports = router;
