const dotenv = require('dotenv')
const path = require('path')

function loadDotenv() {
  const file = path.resolve(__dirname, '../.env')
  const result = dotenv.config({ path: file })
  if (result.error) {
    const productionFile = path.resolve(__dirname, '../.env.production')
    dotenv.config({ path: productionFile })
  }
}

loadDotenv()
