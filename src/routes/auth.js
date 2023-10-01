const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user'));

const router = express.Router();

router.get('/signup', (req, res) => {
  let errorMessage = null;
  res.render('signup', { title: 'ReVUW | SignUp', user: req.session.user, userEmail: req.body.email, errorMessage: errorMessage});
});
router.post('/signup', async (req, res) => {
  let userPassword = req.body.password;
  let passwordCheckResult = checkPasswordStrength(userPassword);
  if (passwordCheckResult != null) {
    res.render('signup', { title: 'ReVUW | SignUp', user: req.session.user, userEmail: req.body.email, errorMessage: passwordCheckResult});
  } 
  else {
    try {
      await User.create({ email: req.body.email, password: userPassword });
      res.redirect('/');
    } catch (error) {
      res.render('signup', { errorMessage: error.message, title: 'Authentication Failed', user: req.session.user });
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

router.get('/login', (req, res) => {
    const errorMessage = req.flash('error');
    res.render('login', { errorMessage: errorMessage[0], title: 'ReVUW | Login', user: req.session.user });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
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
  failureRedirect: '/auth/login'
}));

module.exports = router;
