const dotenv = require('dotenv')
const path = require('path')

function loadDotenv() {
  const file = path.resolve(__dirname, '../.env')
  const result = dotenv.config({ path: file })
  if (result.error) {
    console.warn('Running development mode. Copy `.env.development` into `.env` and change variables as you need')
    console.warn('command: cp .env.development .env')
  }
}

loadDotenv()
