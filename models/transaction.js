var mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

// CreatedAt is not added because createdAt = ObjectId(_id).getTimestamp()

const TransactionsSchema = new Schema({
    senderWallet: Object,
    functionCode: String,
    stateCode: { type: String, enum: ['NEW', 'PENDING', 'COMPLETED'], default: "NEW" },
    nonce: { type: Number, default: 0 },
    documentId: Number,
    payload: Object,
    operationalLock: { type: Boolean, default: false },
    postProcessEvent: String,
    postProcessingPayload: Object,
    referenceId: String,
    attemptCount: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false }
}, { strict: false })

TransactionsSchema.plugin(timestamps)

module.exports = TransactionsSchema;