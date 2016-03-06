var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = function(req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || '';
    user.profile.firstName = req.body.firstName || '';
    user.profile.lastName = req.body.lastName || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Profile information updated.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });
    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' account has been unlinked.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec(function(err, user) {
          if (err) {
            return next(err);
          }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save(function(err) {
            if (err) {
              return next(err);
            }
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * GET /candidate/list
 * Pulls all candidates into an Array
 */
 exports.getCandidates = function(req,res,next){
   if (!req.user) {
     return next("Please login again");
   }
   User.findById(req.user.id, function(err, user){
     res.render('account/list', {
       candidates: user.candidatesList,
       title: 'Candidate List'
     });
   });
 }

 exports.getCandidateArray = function (req,res,next) {
   userEmail = req.params.email;

   var param = { email: userEmail };
   User.findOne(param, function(err, user){
       res.status(200).send({
          candidates: user.candidatesList,
       });
   });
 }

/**
 * POST /candidate/add
 * A Recruiter can Add a Candidate to their list
 */
 exports.postCandidate = function(req,res,next) {
   console.log("starting post candidate");
   // console.log(req);
   // assert.equal(req.user, null);


   var newCandidate = {};

   newCandidate.title = req.body.title || '';
   newCandidate.firstName = req.body.firstName || '';
   newCandidate.lastName = req.body.lastName || '';
   newCandidate.email = req.body.email || '';
   newCandidate.location = req.body.location || '';
   newCandidate.picture = req.body.picture || '';
   newCandidate.linkedin = req.body.linkedin || '';
   newCandidate.resume = req.body.resume || '';
   newCandidate.portfolio = req.body.portfolio || [];
   newCandidate.dateScanned = new Date();
   newCandidate.comments = '';

   console.log(newCandidate);

if (req.user) {
   User.findByIdAndUpdate(req.user.id,
     {$push: {"candidatesList": newCandidate}},
     {safe:true, upsert: true, new:true},
     function(err, model) {
       if (err) {
         return next(err);
       }
       req.flash('success', { msg: 'Candidate Added to list' });
       res.status(200).send('ok')
     });
   }
   else {
     User.findByIdAndUpdate("56d25a0cda84b94004cff4ae",
       {$push: {"candidatesList": newCandidate}},
       {safe:true, upsert: true, new:true},
       function(err, model) {
         if (err) {
           return next(err);
         }
         req.flash('success', { msg: 'Candidate Added to list' });
         res.status(200).send('ok')
       });
     }
 }

 /**
  * POST /candidate/add
  * A Recruiter can Add a Candidate to their list
  */
  exports.postCandidateEmail = function(req,res,next) {
    console.log(req.params.email);
    // console.log(req);
    // assert.equal(req.user, null);
    var params =  {
      email: req.params.email
    }


    var newCandidate = {};

    newCandidate.title = req.body.title || '';
    newCandidate.firstName = req.body.firstName || '';
    newCandidate.lastName = req.body.lastName || '';
    newCandidate.email = req.body.email || '';
    newCandidate.location = req.body.location || '';
    newCandidate.picture = req.body.picture || '';
    newCandidate.linkedin = req.body.linkedin || '';
    newCandidate.resume = req.body.resume || '';
    newCandidate.portfolio = req.body.portfolio || [];
    newCandidate.dateScanned = new Date();
    newCandidate.comments = '';

    User.findOneAndUpdate(params,
      {$push: {"candidatesList": newCandidate}},
      {safe:true, upsert: true, new:true},
      function(err, model) {
        if (err) {
          return next(err);
        }
        req.flash('success', { msg: 'Candidate Added to list' });
        res.status(200).send('ok')
      });
  }

 /**
  * Delete /candidate/delete
  * A Recruiter can Delete a Candidate from their list
  */
  exports.deleteCandidate = function(req,res,next){
      // The Candidate we want to delete
      var xCandidate = req.params.candidate;
      var Recruiter = req.user;

      User.findById(Recruiter, function(err, user){
        //   Find the index position of the Candidate
        // Todo: Use the Recruiter to determine how to remove the
        // candidate from their list. It should iterate through the array and give the index to splice at.
        console.log(xCandidate);
        var CandidateList = user.candidatesList;
        console.log(CandidateList);
         var candidateListIndexPos = CandidateList.map(function(candidate){
              return candidate._id;
          }).indexOf(xCandidate._id);

          if (!candidateListIndexPos) {
            return next("Something went wrong in finding candidate list position.");
          }

          // Remove Candidate From List
         user.candidatesList.splice(candidateListIndexPos, 1);

         // Save new array
         user.save( function(err) {
           if (err) {
             return next(err);
           }
           req.flash('success', { msg: 'Candidate Removed from list' })
           res.redirect('/candidate/list');
         })
      });
  }

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'No account with that email address exists.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function(err) {
        req.flash('info', { msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/forgot');
  });
};
