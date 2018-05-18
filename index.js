'use strict';

console.log('Loading function');

const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const ets = new aws.ElasticTranscoder();

const config = {
    pipeline_id: process.env.PIPELINE_ID,
    output_folder: process.env.OUTPUT_FOLDER,
    output_key_prefix: process.env.OUTPUT_KEY_PREFIX,
    output_preset_id: process.env.OUTPUT_PRESET_ID
}

const submitTranscodingJob = (object_key) => {
    console.log(`submitting transcoding job for object ${object_key}`)
    var params = {
        PipelineId: config.pipeline_id,
        OutputKeyPrefix: config.output_folder,
        Input: {
            Key: object_key
        },
        Outputs: [{
            Key: `${config.output_key_prefix}-${object_key}`,
            PresetId: config.output_preset_id,
            ThumbnailPattern: `thumbnails/${object_key}-{resolution}-{count}`,
        }]
    }

    ets.createJob(params, function(err, data) {
        if (err){
            console.log(`An error occurred creating the elastic transcoder job: ${err}`, err.stack); // an error occurred
            return
        }

        console.log(`elastic transcoder job successfully submitted:\n${JSON.stringify(data, null, 2)}`)
    })
}

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    /*const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };*/

    console.log('Received event:', JSON.stringify(event, null, 2))

    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

    if(key.toLowerCase().endsWith(".mp4") !== true){
        console.log(`skipping ${key} as it did not end in ".mp4"`)
        return callback(null, 'success - but skipped file because it was not an mp4');
    }

    submitTranscodingJob(key)
    callback(null, `successfully transocded ${key}`);

    /*s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            console.log('CONTENT TYPE:', data.ContentType);
            callback(null, data.ContentType);
        }
    });*/
};
