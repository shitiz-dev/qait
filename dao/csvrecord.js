const CSVRecordSchema = require('../models/csvrecord');
const mongoose = require('mongoose')
const CSVRecord = mongoose.model('CSVRecord', CSVRecordSchema)


async function saveCSVRecord(csvRecords) {
    try {
        const csvObj = {
            csvRecord: csvRecords.csvRecord,
            error: csvRecords.error || {},
            event: csvRecords.event,
            fileId: csvRecords.fileId || '',
            operationId: csvRecords.operationId,
            status: csvRecords.status,
            uploadedBy: csvRecords.uploadedBy
        }
        const csvRecord = await CSVRecord.create(csvObj);
        return { value: csvRecord };
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'saveCSVRecord' } } }
    }
}

module.exports = { saveCSVRecord }