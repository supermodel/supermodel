const dotenv = require('dotenv');
const path = require('path');

function loadDotenv() {
  const config = tryConfig('../.env') || tryConfig('../.env.production');

  if (!config) {
    throw new Error("Can't load .env config");
  }
}

function tryConfig(path) {
  const file = path.resolve(__dirname, '../.env');
  const result = dotenv.config({
    path: file,
  });

  if (!result.error) {
    return result;
  }
}

loadDotenv();
