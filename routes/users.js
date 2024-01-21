// Imports
const express = require("express");
const router = express.Router();
const path = require("path");
const knex = require("knex")(require("../knexfile.js"));
const jwt = require("jsonwebtoken");

// Import the utility functions
const utils = require("../utils.js");

// ==============================
// ====== Middleware Paths ======
// ==============================

const authorize = (req, res, next) => {
  // Check if the authorization header wasn't set
  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: "This route requires an authorization header",
    });
  }

  // Check if the authorization token is missing "Bearer "
  if (req.headers.authorization.indexOf("Bearer") === -1) {
    return res
      .status(401)
      .json({ success: false, message: "The authorization token is invalid!" });
  }

  // Get the token itself for the authorization header (without "Bearer ")
  const authToken = req.headers.authorization.split(" ")[1];

  jwt.verify(authToken, process.env.JWT_SECRET, (err, decoded) => {
    // Check if there was an error when verifying the JWT token
    if (err) {
      return res.status(401).json({
        success: false,
        message: "The authorization token is invalid",
      });
    }

    // Set the decoded token on the request object, for the endpoint to use
    req.jwtDecoded = decoded;

    // Move on to the next middleware function
    next();
  });
};

// ==============================
// ======== Users Paths =========
// ==============================

// Register user path
router.route("/register").post(async (req, res) => {
  const reqUserObj = {
    email: req.body["email"],
    password: req.body["password"],
    first_name: req.body["first_name"],
    last_name: req.body["last_name"],
    is_admin: false,
  };

  // Check if all required headers are present
  if (!reqUserObj.password || !reqUserObj.email) {
    return res.status(400).send("Please enter password and email in headers");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(reqUserObj.email)) {
    return res.status(400).send("Invalid email format.");
  }

  reqUserObj.password = utils.hashData(reqUserObj.password);

  try {
    const existingUser = await knex("users")
      .where("email", reqUserObj.email)
      .first();

    if (!existingUser) {
      // No existing user, insert new user
      await knex("users").insert(reqUserObj);
      console.log(`User "${reqUserObj.first_name}" created`);
      res.status(201).json({ message: "User created successfully." });
    } else {
      // User already exists
      res.status(409).json({ message: "User already exists." });
    }
  } catch (error) {
    console.error("Database error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login path
router.route("/login").post((req, res) => {
  const login = req.headers["login"];
  const password = req.headers["password"];

  if (!login || !password) {
    res.status(400).send("Missing login or password!");
  }

  const hashedPassword = utils.hashData(password);

  knex("users").then((users) => {
    // Search for user in database
    const foundUser = users.find(
      (user) => user.username === login || user.email === login
    );

    // Handle if no user found
    if (!foundUser) {
      return res.status(400).json({
        success: false,
        error: "Account does not exist!",
      });
    }

    // Validate the supplied password matches the password in the database
    if (hashedPassword !== foundUser.password) {
      return res.status(400).json({
        success: false,
        error: "Username/Password combination is incorrect",
      });
    }

    // If user exists and password is correct, return success response
    const token = jwt.sign(
      {
        user_id: foundUser.user_id,
        username: foundUser.username,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name,
        email: foundUser.email,
        loginTime: Date.now(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1440m" }
    );

    // Send the JWT token to the frontend
    return res.status(200).json({ token });
  });
});

// Profile path to receive JWT token and send back data
router.route("/profile").get(authorize, (req, res) => {
  const token = req.jwtDecoded;

  if (!token) {
    res.status(500).send("Not logged in or no token");
  } else {
    res.status(200).json(token);
  }
});

module.exports = router;
