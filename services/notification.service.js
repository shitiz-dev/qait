const NOTIFICATION_SERVICE_ENDPOINT = process.env.NOTIFICATION_SERVICE_BASE_URL + process.env.NOTIFICATION_SERVICE_PATH
const SEND_NOTIFICATIONS_URL = '/sendnotification'
const requestPromise = require('request-promise-native')



function sendEmailNotification({ to, type, data }, cb) {
    return notify({ to, category: 'email', subCategory: type, data }, cb)
}

function notify({ from, to, message, category, subCategory, resourceId, data }, cb = () => { }) {
    const payload = { from, to, message, category, subCategory, resourceId, data }
    const options = {
        method: 'POST',
        uri: `${NOTIFICATION_SERVICE_ENDPOINT}${SEND_NOTIFICATIONS_URL}`,
        body: payload,
        json: true
    }

    return requestPromise(options)
        .then(function (parsedBody) {
            // console.log('response of send notification', parsedBody.response)
            cb(null, parsedBody.response)
            return Promise.resolve({ value: parsedBody.response })
        })
        .catch(function (err) {
            cb(err)
            // console.log('error in sending notifications', err)
            return Promise.resolve({ error: err })
        });
}

module.exports = {
    sendEmailNotification,
}
