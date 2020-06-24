const CsvTemplateSchema = require('../models/csvtemplate');
const mongoose = require('mongoose')
const CsvTemplate = mongoose.model('csvTemplate', CsvTemplateSchema)

const getCsvTemplateById = async function (templateId) {
    try {
        if (templateId) {
            const csvTemplate = await CsvTemplate.findOne({ _id: templateId });
            return { value: csvTemplate };
        } else {
            return { error: { type: 'info', message: 'Template id is mandatory', location: { file: __filename, function: 'getCsvTemplateById' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'getCsvTemplateById' } } }
    }
}

module.exports = {
    getCsvTemplateById
}