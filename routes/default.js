// Imports
const express = require("express");
const router = express.Router();
const path = require("path");
const knex = require("knex")(require("../knexfile.js"));

// Import the utility functions
const utils = require("../utils.js");

// ==============================
// ====== Middleware Paths ======
// ==============================

const authorize = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  try {
    const keyExists = await knex("users")
      .select("*")
      .where("api_key", apiKey)
      .first();

    if (!keyExists) {
      return res.status(403).json({ error: "Invalid API key" });
    }
    next(); // Proceed to the next middleware/function if the API key is valid
  } catch (error) {
    console.error("Database error: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==========================
// ====== Default path ======
// ==========================

// Default path to explain API
router.route("/").get((req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// ==============================
// ======= Catch All path =======
// ==============================
router.route("*").get((req, res) => {
  res.send(
    "Path not defined. Try a different path or refer to '/' path to start."
  );
});

module.exports = router;
