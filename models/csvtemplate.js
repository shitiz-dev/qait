const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

const CsvTemplate = new Schema({
    title: { type: String },
    companyId: { type: String },
    docType: { type: Schema.Types.ObjectId },
    fieldInfo: { type: Object, defalut: {} },
    isDeleted: { type: Boolean, default: false },
    hash: { type: String },
    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
})

CsvTemplate.plugin(timestamps)
module.exports = CsvTemplate