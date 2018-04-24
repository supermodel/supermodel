function loadDotenv() {
  const result = require('dotenv').config()
  if (result.error) {
    console.error('Running development mode. Copy `.env.development` into `.env` and change variables as you need')
    console.error('command: cp .env.development .env')
    process.exit(1)
  }
}

loadDotenv()
