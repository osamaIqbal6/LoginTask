const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/users");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
module.exports = function (passport) {
  passport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
      try {
        // Look up the user by username
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: "Unknown User" });
        }

        // Compare password using bcrypt.compare
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          console.log("Matched");
          return done(null, user);
        } else {
          return done(null, false, { message: "Password incorrect" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // Replace with your Google OAuth client ID
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Replace with your Google OAuth client secret
        callbackURL: "http://localhost:5000/auth/google/callback", // Adjust the callback URL
      },
      (accessToken, refreshToken, profile, done) => {
        console.log("Logged in using Google");
        return done(null, profile);
      }
    )
  );
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/github/callback", // Adjust the callback URL
      },
      (accessToken, refreshToken, profile, done) => {
        // Handle GitHub OAuth authentication here
        // 'profile' contains user information from GitHub
        return done(null, profile);
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
};
