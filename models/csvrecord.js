const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

const CSVRecordSchema = new Schema({
    deleted: { type: Boolean, default: false },
    csvRecord: Object,
    error: Object,
    fileId: Schema.Types.ObjectId,
    event: String,
    operationId: Schema.Types.ObjectId,
    status: { type: String, enum: ['success', 'error'] },
    uploadedBy: String,
})
CSVRecordSchema.plugin(timestamps)

module.exports = CSVRecordSchema;