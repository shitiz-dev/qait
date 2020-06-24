const UserSchema = require('../models/user');
const mongoose = require('mongoose')
const User = mongoose.model('user', UserSchema)

async function createUser(userObj) {
    try {
        if (userObj.personal.length) {
            const user = await User.create(userObj);
            return { value: user };
        } else {
            return { error: { type: 'info', message: 'Personal object is missing', location: { file: __filename, function: 'createUser' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'createUser' } } }
    }
}


module.exports = { createUser }