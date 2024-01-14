require("dotenv").config();
const fs = require("fs");
const env = require("dotenv").config({ path: __dirname + "/.env" });
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: "utf8",
  },
  pool: { min: 0, max: 1000 },
};
