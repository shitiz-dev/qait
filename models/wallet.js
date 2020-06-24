const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')
const Wallet = new Schema({
    address: String,
    key: String,
    pubKey: String,
    seed: String,
    uid: String,
    deleted: { type: Boolean, default: false }
})
Wallet.plugin(timestamps)

module.exports = Wallet;