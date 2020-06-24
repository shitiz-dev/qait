const AWS = require('aws-sdk');
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

async function createSQSQueue(QueueName) {
    try {
        const params = {
            QueueName: `${QueueName}`,
            Attributes: {
                // 'ReceiveMessageWaitTimeSeconds': '20',
                // 'FifoQueue': 'true',
                // ContentBasedDeduplication: 'true'
            }
        };
        const res = await sqs.createQueue(params).promise()
        return { value: res.QueueUrl }
    } catch (err) {
        return { error: err }
    }
}

async function getQueueURL(QueueName) {
    try {
        const params = {
            QueueName
        };

        const res = await sqs.getQueueUrl(params).promise()
        return { value: res.QueueUrl }
    } catch (err) {
        return { error: err }
    }
}

async function sendQueueMessage(SQS_QUEUE_URL, messageBody, MessageAttributes, MessageGroupId) {
    try {
        const params = {
            MessageAttributes,
            MessageBody: JSON.stringify(messageBody),
            QueueUrl: SQS_QUEUE_URL,
            // MessageGroupId
        };
        const res = await sqs.sendMessage(params).promise()
        // console.log('sent succesfully', res)
        return { value: res }
    } catch (err) {
        // console.log('error in sending message', err)
        return { error: err }
    }
}

async function receiveQueueMessages(SQS_QUEUE_URL, WaitTimeSeconds, MaxNumberOfMessages) {
    try {
        const params = {
            // AttributeNames: [
            //     "All"
            // ],
            MaxNumberOfMessages: MaxNumberOfMessages,
            // MessageAttributeNames: [
            //     "All"
            // ],
            QueueUrl: SQS_QUEUE_URL,
            WaitTimeSeconds: WaitTimeSeconds
        };
        const res = await sqs.receiveMessage(params).promise()
        return { value: res.Messages }

    }
    catch (err) {
        return { error: err }
    }
}

async function deleteQueueMessage(queueURL, ReceiptHandle) {
    try {
        const deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle
        }
        const res = await sqs.deleteMessage(deleteParams).promise()
        // console.log('@@@@@@@@@ delete', res)
        return { value: res.Messages }

    }
    catch (err) {
        // console.log('error in delete queue mssg', err)
        return { error: err }
    }
}

module.exports = { createSQSQueue, sendQueueMessage, receiveQueueMessages, getQueueURL, deleteQueueMessage }