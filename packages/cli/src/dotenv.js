const dotenv = require('dotenv')
const path = require('path')

function loadDotenv() {
  const file = path.resolve(__dirname, '../.env')
  const result = dotenv.config({ path: file })
  if (result.error) {
    const productionFile = path.resolve(__dirname, '../.env.production')
    dotenv.config({ path: productionFile })
    // console.warn('Running development mode. Copy `.env.development` into `.env` and change variables as needed (\'cp .env.development .env\').')
  }
}

loadDotenv()
