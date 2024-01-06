const express = require('express');
const passport = require('passport');
const router = express.Router();

const authenticateGoogle = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }

    if (!user) {
      return res.redirect('/');
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return res.redirect('/');
      }
      return next();
    });
  })(req, res, next);
};

router.get('/google', passport.authenticate('google', { scope: ['profile'], prompt: 'consent' }));
router.get('/google/callback', authenticateGoogle, (req, res) => {
  res.redirect('/dashboard');
});
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = { authRouter: router };
