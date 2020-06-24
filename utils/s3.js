const S3 = require('aws-sdk/clients/s3');
var fs = require('fs');

const storage = new S3();

const writeFile = (key, path, bucketName = process.env.APP_CONFIG_STORAGE) => {
    const params = {
        Bucket: bucketName,
        Key: key
    };
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path);
        storage.getObject(params)
        .on('httpData', function (chunk) {
            file.write(chunk);
        })
        .on('success', function () {
            // console.log('File successfully downloaded from S3')
        })
        .on('error', function (err) {
            reject(err)
        })
        .on('complete', function () {
            file.end(() => {
                resolve('success')
            });
        })
        .send();
    })
};

module.exports = {
    writeFile
}

