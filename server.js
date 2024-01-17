const express = require("express");
const app = express();
const cors = require("cors");
const env = require("dotenv").config({ path: __dirname + "/.env" });

// Import the routes from the routes folder
const defaultRoute = require("./routes/default");
const usersRoute = require("./routes/users");
const photosRoute = require("./routes/photos");
const playlistRoute = require("./routes/playlists");

// Enable cors
app.use(cors());
// Serve static assets from server
app.use(express.static("public"));

// Route using default route to valorant.js
app.use("/users", usersRoute);
app.use("/photos", photosRoute);
app.use("/playlists", playlistRoute);
app.use("/", defaultRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
