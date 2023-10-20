const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user'));
const ResetToken = require(path.join(__dirname, "..", 'models', 'resetToken'));

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.PASSWORD_RESET_EMAIL_USERNAME,
    pass: process.env.PASSWORD_RESET_EMAIL_PASSWORD,
  },
});

// Password reset
router.get('/reset-password/:token', (req, res) => {
  req.session.resetToken = req.params.token;
  // Redirect to the general reset page
  res.redirect('/auth/reset-password');
});

router.get('/reset-password', (req, res) => {
  if (!req.session.resetToken) {
    res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: null, passwordError: 'Invalid session for password reset.' });
  }
  res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: null, passwordError: null });
});

router.post('/request-password-reset', async (req, res) => {
  const email = req.body.resetEmail;

  const token = crypto.randomBytes(32).toString('hex');

  const user = await User.findOne({ email: email });
  if (!user) {
      return res.status(400).send('Email address not found.');
  }
  await ResetToken.create({ user: user._id, token });

  const resetLink = `http://localhost:3000/auth/reset-password/${token}`;

  transporter.sendMail({
    to: email,
    subject: 'ReVUW password reset request',
    text: `Click the following link to reset your password: ${resetLink}`

  })
  res.render('signin', {layout: 'layouts/fullWidth', passwordError: null, errorMessage: null, successMessage: 'Password reset email sent!', title: 'ReVUW | Login', user: req.session.user, activeTab: 'login' });
});

router.post('/reset-password', async (req, res) => {
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.repeatNewPassword;
  if (!newPassword) {
    return res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: null, passwordError: 'New password is missing.' });
  }
  let passwordCheckResult = checkPassword(newPassword, confirmPassword);
  if (passwordCheckResult != null) {
    return res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: null, passwordError: passwordCheckResult });
  }

  const token = req.session.resetToken;
  const resetToken = await ResetToken.findOne({ token }).populate('user');
  if (!resetToken) {
    return res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: null, passwordError: 'Invalid or expired token.' });
  }

  const user = resetToken.user;
  user.password = newPassword;
  await user.save();

  await ResetToken.deleteOne({ _id: resetToken._id });
  delete req.session.resetToken;

  return res.render('password-reset', { title: 'Password Reset', user: null, successfulReset: 'Password successfully reset.', passwordError: null});
});

//Signup
router.get('/signup', (req, res) => {
  if(req.query.origin)
    req.session.returnTo = req.query.origin;
  else
    req.session.returnTo = req.header('Referer');
    
  res.render('signin', { layout: 'layouts/fullWidth', title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: null, errorMessage: null, successMessage: null,  activeTab: 'register' });
});


router.post('/signup', async (req, res) => {
  const userPassword = req.body.registerPassword;
  const confirmPassword = req.body.registerRepeatPassword;
  const userEmail = req.body.email;
  let passwordCheckResult = checkPassword(userPassword, confirmPassword);
  if (passwordCheckResult != null) {
    res.render('signin', {layout: 'layouts/fullWidth', title: 'ReVUW | SignUp', user: req.user, userEmail: req.body.email, passwordError: passwordCheckResult, errorMessage: null, successMessage: null,  activeTab: 'register'});
  } 
  else {
    try {
      const emailIsUnique = await isEmailUnique(userEmail);
      if (!emailIsUnique) {
        res.render('signin', {layout: 'layouts/fullWidth', title: 'ReVUW | SignUp', user: req.session.user, userEmail: req.body.email, errorMessage: null, passwordError: 'Email already in use', successMessage: null,  activeTab: 'register'});
      } else {
        await User.create({ email: userEmail, password: userPassword });

        let returnTo = req.session.returnTo || '/';
        delete req.session.returnTo; // Cleanup session
        res.redirect(returnTo);
      }
    } catch (error) {
      res.render('signin', {layout: 'layouts/fullWidth', passwordError: error.message,  errorMessage: null, successMessage: null,  title: 'Authentication Failed', user: req.user, activeTab: 'register' });
    }
  }
});

function checkPassword(userPassword, confirmPassword) {
  let errorMessage = null;
  if (userPassword.length < 8) {
    errorMessage = 'Use 8 characters or more for your password';
  } else if (!/(?=.*[a-z])/.test(userPassword) || !/(?=.*[A-Z])/.test(userPassword) || !/[0-9]/.test(userPassword)) {
    errorMessage = 'Please choose a stronger password. Use a mix of numbers and letters with upper and lower case';
  } else if (!(userPassword === confirmPassword)){
    errorMessage = 'Passwords do not match';
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
    res.render('signin', {layout: 'layouts/fullWidth', passwordError: null, errorMessage: errorMessage[0], successMessage: null,  title: 'ReVUW | Login', user: req.session.user, activeTab: 'login' });
  });
});

router.post('/signin', storeRedirectInLocals, passport.authenticate('local', {
  failureRedirect: '/auth/signin',
  failureFlash: true
}), (req, res) => {
  let returnTo = res.locals.returnTo || '/'
  if (returnTo == 'http://localhost:3000/auth/reset-password') {
    returnTo = '/';
  }
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
