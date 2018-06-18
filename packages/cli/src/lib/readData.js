const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

async function readData(filePath) {
  const ext = path.extname(filePath)
  const content = fs.readFileSync(filePath, 'utf8')

  if (ext === '.json') {
    return JSON.parse(content)
  } else if (ext === '.yml' || ext === '.yaml') {
    return yaml.load(content)
  } else {
    try {
      return JSON.parse(content)
    } catch(e1) {
      if (e1 instanceof SyntaxError) {
        try {
          return yaml.load(content)
        } catch(e2) {
          if (e2 instanceof yaml.YAMLException) {
            throw new SyntaxError(`File '${filePath}' is not valid JSON or YAML`)
          }

          throw(e2)
        }
      }

      throw(e1)
    }
  }
}


module.exports = readData
