const AuthSchema = require('../models/auth');
const mongoose = require('mongoose')

const Auth = mongoose.model('EmailVerification', AuthSchema);

async function updateActionCode({ emailId, actionCode }) {
    try {
        const updateRes = await Auth.updateOne({ email: emailId }, { actionCode: actionCode }, { upsert: true })

        return { value: updateRes }
    }
    catch (err) {

        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'updateAuth' } } }
    }
}

module.exports = {
    updateActionCode
}