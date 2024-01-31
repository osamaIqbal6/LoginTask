const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/users"); // Adjust the path as necessary
const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    // Create a new user with the hashed password
    const newUser = new User({
      username,
      password: password, // Store the hashed password
    });
    console.log(newUser);
    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send(info.message);
    }

    // Manually establish the session
    req.login(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.send("Logged in successfully");
    });
  })(req, res, next);
});
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect or respond as needed
    console.log("loggedInWithGoogle"); // Replace with your desired route
  }
);
router.get("/github", passport.authenticate("github"));

// Route to handle GitHub OAuth callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/", // Redirect after successful login
    failureRedirect: "/login", // Redirect after failed login
  }),
  (req, res) => {
    console.log("loggedinwithgithub");
  }
);
// Route for a protected page (requires authentication)
router.get("/profile", ensureAuthenticated, (req, res) => {
  // This route is protected and only accessible to authenticated users
  res.send("Profile Page");
});
// Example route for logging out a user
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      // Handle any potential errors
      console.error(err);
    }
    res.redirect("/"); // Redirect to the homepage or any other desired page after logout
  });
});

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // User is authenticated
    return next();
  } else {
    // User is not authenticated, redirect to login
    res.redirect("/login"); // Replace with your login route
  }
}
module.exports = router;
