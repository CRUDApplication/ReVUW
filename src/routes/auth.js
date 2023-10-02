const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user'));

const router = express.Router();

//Signup
router.get('/signup', (req, res) => {
  let errorMessage = null;
  res.render('signin', { title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: errorMessage, errorMessage: null, activeTab: 'register' });
});

router.post('/signup', async (req, res) => {
  let userPassword = req.body.registerPassword;
  let passwordCheckResult = checkPasswordStrength(userPassword);
  if (passwordCheckResult != null) {
    res.render('signin', { title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: passwordCheckResult, errorMessage: null, activeTab: 'register'});
  } 
  else {
    try {
      await User.create({ email: req.body.email, password: userPassword });
      res.redirect('/');
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

//Login
router.get('/signin', (req, res) => {
  const errorMessage = req.flash('error');
  res.render('signin', {  passwordError: null, errorMessage: errorMessage[0], title: 'ReVUW | Login', user: req.user, activeTab: 'login' });
});

router.post('/signin', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/signin',
  failureFlash: true
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/auth/signin'
}));

module.exports = router;
