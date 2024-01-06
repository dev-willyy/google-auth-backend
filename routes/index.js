const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middlewares/authMiddleware.js');
const Story = require('../models/Story.js');

router.get('/', ensureGuest, (req, res, next) => {
  res.render('login', {
    layout: 'login',
  });
});

router.get('/dashboard', ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({ user: req.user.id }).lean();
    res.render('dashboard', {
      name: req.user.firstName,
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render('errors/500');
  }
});

module.exports = { loginRouter: router };
