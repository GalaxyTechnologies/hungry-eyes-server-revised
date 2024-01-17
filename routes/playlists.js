// Imports
const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const knex = require("knex")(require("../knexfile.js"));
const env = require("dotenv").config({ path: __dirname + "/.env" });
const jwt = require("jsonwebtoken");

// Import the utility functions
const { isObjectFullyPopulated } = require("../utils.js");

// === AWS and Multer Setup ===
// Configure multer for file handling
const upload = multer({ dest: "uploads/" });

// AWS SDK Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

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
// ======= Playlists Paths ======
// ==============================

// Default playlists path
router
  // Retrieve list of playlists for user
  .get("/", authorize, async (req, res) => {
    res.send("Test Get Playlists");
  })
  // Create new playlist
  .post("/", authorize, async (req, res) => {
    res.send("Test Create New Playlist");
  })
  // Delete playlist
  .delete("/", authorize, async (req, res) => {
    res.send("Test Deletion of Playlist");
  });

module.exports = router;
