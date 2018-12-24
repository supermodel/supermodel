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

  test.only('works with dir', async () => {
    const brokenSchema = path.resolve(__dirname, './__fixtures__')
    await convertOAS2(brokenSchema)

    expect(mockExit).toBeCalledWith(1)
  })

  test('works with file', async () => {
    const brokenSchema = path.resolve(__dirname, './__fixtures__/broken.yaml')
    await convertOAS2(brokenSchema)

    expect(mockExit).toBeCalledWith(1)
  })
})
