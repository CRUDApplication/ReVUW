const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');
const { db } = require('../models/user');
const User = require(path.join(__dirname, '..', 'models', 'user'));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value
      });
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
}));

passport.use(new LocalStrategy({
    usernameField: 'loginName',
    passwordField: 'loginPassword'
  }, 
  async (loginName, loginPassword, done) => {
    try {
      const user = await User.findOne({ email: loginName });
      if (!user) return done(null, false, { message: 'No user found.' });
      const isMatch = await bcrypt.compare(loginPassword, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});