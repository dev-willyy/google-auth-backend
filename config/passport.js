const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');

// Login/Register
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
        };

        try {
          const user = await User.findOne({ googleId: profile.id });

          if (user) {
            done(null, user);
          } else {
            await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        if (!user) return done(null, false);
        done(null, user);
      })
      .catch((err) => done(err));
  });
};
