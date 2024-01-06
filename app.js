const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const { loginRouter } = require('./routes/index.js');
const { authRouter } = require('./routes/auth.js');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db.js');
const { storiesRouter } = require('./routes/stories.js');

require('dotenv').config({ path: './config/config.env' });
require('./config/passport.js')(passport);

connectDB();
const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs.js');

app.engine(
  '.hbs',
  exphbs.engine({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: 'main',
    extname: '.hbs',
  })
);
app.set('view engine', '.hbs');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_TOKEN,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      mongooseConnection: mongoose.connection,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', loginRouter);
app.use('/auth', authRouter);
app.use('/stories', storiesRouter);

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Express server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
