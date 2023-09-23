const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'user'));

const router = express.Router();

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', async (req, res) => {
    try {
      await User.create({ email: req.body.email, password: req.body.password });
      res.redirect('/');
    } catch (error) {
      res.render('/auth/signup', { error: error.message });
    }
  });

router.get('/login', (req, res) => {
    const errorMessage = req.flash('error');
    res.render('login', { errorMessage: errorMessage[0] });
});
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}));

module.exports = router;
