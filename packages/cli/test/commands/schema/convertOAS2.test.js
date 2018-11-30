const path = require('path')
const convertOAS2 = require('../../../src/commands/schema/convertOAS2')

describe('convertOAS2', () => {
  let originalExit
  let mockExit

  beforeEach(() => {
    originalExit = process.exit

    mockExit = jest.fn(() => {})

    process.exit = mockExit
  })

  afterEach(() => {
    process.exit = originalExit
  })

  test('works', async () => {
    const brokenSchema = path.resolve(__dirname, './fixtures/broken.yaml')
    await convertOAS2(brokenSchema)

    expect(mockExit).toBeCalledWith(1)
  })
})
