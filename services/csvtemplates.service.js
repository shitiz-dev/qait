const CsvTemplateDao = require('../dao/csvtemplate');


const loadCsvTemplate = async function (templateId, cb = () => { }) {
    try {
        if (templateId) {
            const { value, error } = await CsvTemplateDao.getCsvTemplateById(templateId);

            if (value) {
                cb(null, value)
                return { value }
            } else {
                cb(error)
                return { error }
            }
        } else {
            cb({ type: 'info', message: 'Template id is mandatory', location: { file: __filename, function: 'loadCsvTemplate' } })
            return Promise.resolve({ error: { type: 'info', message: 'Template id is mandatory', location: { file: __filename, function: 'loadCsvTemplate' } } })
        }
    } catch (error) {
        cb({ type: 'error', ...error.spread(), location: { file: __filename, function: 'loadCsvTemplate' } })
        return Promise.resolve({ error: { type: 'error', ...error.spread(), location: { file: __filename, function: 'loadCsvTemplate' } } })
    }
}



module.exports = {loadCsvTemplate}
