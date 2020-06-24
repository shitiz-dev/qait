const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

const AuthSchema = new Schema({
    email: String,
    actionCode: String
})

AuthSchema.plugin(timestamps)

module.exports = AuthSchema;