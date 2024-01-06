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
    res.render('errors/500');
  }
});

router.get('/', ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({ status: 'public' }).populate('user').sort({ createdAt: 'desc' }).lean();

    res.render('stories/index', { stories });
  } catch (err) {
    console.error(err);
    res.render('errors/500');
  }
});

router.get('/:id', ensureAuth, async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate('user').lean();

    if (!story) return res.render('errors/404');

    res.render('stories/show', {
      story,
    });
  } catch (err) {
    console.error(err);
    return res.render('errors/500');
  }
});

router.get('/edit/:id', ensureAuth, async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).lean();

    if (!story) return res.render('errors/404');

    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      res.render('stories/edit', { story });
    }
  } catch (err) {
    console.error(err);
    return res.render('errors/400');
  }
});

router.put('/:id', ensureAuth, async (req, res, next) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) return res.render('errors/404');

    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error(err);
    return res.render('errors/500');
  }
});

router.delete('/:id', ensureAuth, async (req, res, next) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('errors/500');
  }
});

router.get('/user/:userId', ensureAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean();

    res.render('stories/index', {
      stories,
    });
  } catch (err) {
    console.error(err);
    return res.render('errors/500');
  }
});

module.exports = { storiesRouter: router };
