const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/authMiddleware.js');
const Story = require('../models/Story.js');

router.get('/add', ensureAuth, (req, res, next) => {
  res.render('stories/add');
});

router.post('/', ensureAuth, async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

router.get('/', ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({ status: 'public' }).populate('user').sort({ createdAt: 'desc' }).lean();

    res.render('stories/index', { stories });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

router.get('/edit/:id', ensureAuth, async (req, res, next) => {
  const story = await Story.findOne({ _id: req.params.id }).lean();

  if (!story) return res.render('error/404');

  if (story.user != req.user.id) {
    res.redirect('/stories');
  } else {
    res.render('stories/edit', { story });
  }
});

module.exports = { storiesRouter: router };
