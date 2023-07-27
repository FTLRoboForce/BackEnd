require("dotenv").config();
require("colors");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  const dbURL = process.env.dbURL;
  console.log("dbURL".blue, dbURL);
  return dbURL;
}

const BCRYPT_WORK_FACTOR = 1;

console.log("BrainForce Config:".red);
console.log("PORT:".blue, PORT);
console.log("BCRYPT_WORK_FACTOR".blue, BCRYPT_WORK_FACTOR);
console.log("Database:".blue, getDatabaseUri());
console.log("---");

module.exports = {
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri
};
