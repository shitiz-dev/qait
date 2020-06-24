const csvRecordDao = require('./../dao/csvrecord')


async function saveCsvRecord({ csvRecord, operationId, fileId, status, uploadedBy, event, error }, saveSuccessRecord = true, cb = () => { }) {
    try {
        const csvRecordDetails = {
            csvRecord, operationId, fileId, status, uploadedBy, event,
            error
        }

        if (status == 'error' || saveSuccessRecord) {


            const csvRecord = await csvRecordDao.saveCSVRecord(csvRecordDetails)

            if (csvRecord.value) {
                cb(null, csvRecord.value)
                return { value: csvRecord.value }
            }
            else {
                cb(csvRecord.error)
                return { error: csvRecord.error }
            }
        }

        return { value: 'Value Not Saved In DB' }
    }
    catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'saveCsvRecord' } } }

    }
}

module.exports  ={saveCsvRecord}