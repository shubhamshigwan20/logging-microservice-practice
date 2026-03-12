const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

module.exports = db;
