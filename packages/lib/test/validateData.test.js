const fs = require('fs')
const { readYAMLFile } = require('@supermodel/file')
const validateData = require('../src/validateData')
const schema = readYAMLFile('./fixtures/data/schema.yaml')

test('validate valid data', () => {
  const data = JSON.parse(fs.readFileSync('./fixtures/data/dataValid.json', 'utf8'))
  return expect(validateData(data, schema)).toBe(true)
})

test('validate invalid data', () => {
  const data = JSON.parse(fs.readFileSync('./fixtures/data/dataInvalid.json', 'utf8'))
  expect(() => {
    console.log(validateData(data, schema))
  }).toThrow("data should have required property 'count'")
})
