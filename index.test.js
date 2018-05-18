const index = require('./index')
const AWS = require('aws-sdk-mock')

const mockEvent = require('./testdata/videouploadevent.json')
const mockCallback = jest.fn()
const mockContext = {}
//const mockEvent = JSON.parse(fs.readFileSync('./testdata/videoupload.json'))

describe(`Lambda function s3-mp4-transcoder`, () => {
  beforeAll(() => {
    AWS.mock("ElasticTranscoder", "createJob", (params, callback) => {
      callback(null, {
        data: "fakedata"
      })
    })
  })

  afterEach(() => {
    delete process.env.PIPELINE_ID
    delete process.env.OUTPUT_FOLDER
    delete process.env.OUTPUT_KEY_PREFIX
    delete process.env.OUTPUT_PRESET_ID
  });

  afterAll(() => {
    AWS.restore()
  })

  test('happy path testing', () => {
    process.env.PIPELINE_ID = 'abc123'
    process.env.OUTPUT_FOLDER = '/output_folder'
    process.env.OUTPUT_KEY_PREFIX = 'output_key_prefix'
    process.env.OUTPUT_PRESET_ID = 'zyx987'

    expect(index).toBeDefined()
    expect(index.handler).toBeDefined()

    index.handler(mockEvent, mockContext, mockCallback)

    const mockEventS3Key = decodeURIComponent(mockEvent.Records[0].s3.object.key.replace(/\+/g, ' '))

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0]).toBeNull()
    expect(mockCallback.mock.calls[0][1]).toBe(`successfully transocded ${mockEventS3Key}`)
  })
})
