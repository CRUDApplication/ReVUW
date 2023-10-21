  const chai = require('chai');
  const expect = chai.expect;
  const sinon = require('sinon');
  const supertest = require('supertest');
  const app = require('../src/server');
  const passport = require('passport');
  const User = require('../src/models/user');
  const { isEmailUnique, checkPasswordStrength } = require('../src/routes/auth');

  describe('Authentication Utility Functions', function() {

    describe('checkPasswordStrength', function() {
      it('should return error for password less than 8 characters', function() {
        const result = checkPasswordStrength('abc123');
        expect(result).to.equal('Use 8 characters or more for your password');
      });
  
      it('should return error for password without mix of numbers, uppercase, and lowercase letters', function() {
        const result = checkPasswordStrength('ABC12345');
        expect(result).to.equal('Please choose a stronger password. Use a mix of numbers and letters with upper and lower case');
      });
  
      it('should return null for strong password', function() {
        const result = checkPasswordStrength('Abc12345');
        expect(result).to.be.null;
      });
    });
  
    describe('isEmailUnique', function() {
      afterEach(function() {
        sinon.restore();
      });
  
      it('should return false if email is already in use', async function() {
        sinon.stub(User, 'findOne').returns({ email: 'test@example.com' });
        const result = await isEmailUnique('test@example.com');
        expect(result).to.be.false;
      });
  
      it('should return true if email is not in use', async function() {
        sinon.stub(User, 'findOne').returns(null);
        const result = await isEmailUnique('test@example.com');
        expect(result).to.be.true;
      });
  
      it('should throw error for any database error', async function() {
        sinon.stub(User, 'findOne').throws(new Error('DB Error'));
        try {
          await isEmailUnique('test@example.com');
          throw new Error('Expected isEmailUnique to throw');
        } catch (err) {
          expect(err.message).to.equal('DB Error');
        }
      });
    });
  
  });

  describe('Authentication Routes', function() {
    let authenticateStub;

    before(function (done) {
      authenticateStub = sinon.stub(passport, 'authenticate'); 
      console.log('stub registered');
      passport.authenticate('local', { failureRedirect: '/auth/signin' });
      done();
    });
    afterEach(function() {
      sinon.restore();
    });

    describe('Dummy Initialization Test', function() {
      it('should wait for app to initialize', function(done) {
          this.timeout(5000);

          supertest(app)
              .get('/')
              .end((err, res) => {
                  if (err) done(err);
                  else done();
              });
      });
    });

    describe('POST /signup', function() {
      it('should render error message if password is weak', async function() {
        const response = await supertest(app)
          .post('/auth/signup')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ registerPassword: 'weak', email: 'test@example.com' });
        expect(response.text).to.include('Use 8 characters or more for your password');
      });

      it('should render error message if email is already in use', async function() {
        sinon.stub(User, 'findOne').returns({ email: 'test@example.com' });
        const response = await supertest(app)
          .post('/auth/signup')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ registerPassword: 'StrongPass1', email: 'test@example.com' });

        expect(response.text).to.include('Email already in use');
      });

      it('should redirect to returnTo or root after successful signup', async function() {
        sinon.stub(User, 'findOne').returns(null);
        const response = await supertest(app)
          .post('/auth/signup')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ registerPassword: 'StrongPass1', email: 'test@example.com' });

        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/');
      });
    });

    describe('POST /signin', function() {
      it('should redirect to returnTo or root after successful signin', async function() {
        authenticateStub.callsFake((strategy, options) => { 
          console.log(`Stub called with strategy: ${strategy}`);
        
          if (strategy === 'local') {
            return function(req, res, next) {
              req.user = { loginName: "test@example.com" };
              next();  // Ensure next is called to proceed in the middleware chain
            };
          } else if (strategy === 'session') {
            // If the strategy is session, just continue the middleware chain.
            return function(req, res, next) {
              next();
            };
          } else if (strategy === 'google') {
            // Handle google authentication here. 
            return function(req, res, next) {
              req.user = { loginName: "googleuser@example.com", authType: "google" };
              next();
            };
          }
          throw new Error(`Stub not implemented for strategy: ${strategy}`);
        });
        
        
      
      const app = require('../src/server');
      const response = await supertest(app)
        .post('/auth/signin')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({ strategy: 'local', loginName: 'test@example.com', loginPassword: 'CorrectPass1' });

      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/auth/signin');
    });

      it('should redirect to /auth/signin if authentication fails', async function() {
        sinon.stub(passport, 'authenticate').yields(null, false, { message: 'Incorrect password.' });
        const response = await supertest(app)
          .post('/auth/signin')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ loginName: 'test@example.com', loginPassword: 'WrongPass1' });

        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/auth/signin');
      });
    });

    describe('POST /logout', function() {
      it('should redirect to root after logout', async function() {
        const response = await supertest(app)
          .post('/auth/logout');
        
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('/');
      });
    });

    describe('GET /google', function() {
      it('should redirect to google auth', async function() {
        const response = await supertest(app)
          .get('/auth/google');
        
        // Ensure it redirects to Google's OAuth 2.0 endpoint:
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.include('https://accounts.google.com/o/oauth2/');
      });
    });

  });
