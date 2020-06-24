const PersonalSchema = require('../models/personal');
const mongoose = require('mongoose')
const Personal = mongoose.model('personal', PersonalSchema);

async function createPersonal(userDetails) {
    try {
        if (userDetails) {
            var personalObj = {
                uid: userDetails.uid,
                name: userDetails.name || '',
                location: userDetails.location || '',
                domain: userDetails.domain || 'OTHERS',
                email: userDetails.email || '',
                phone: userDetails.phone || '',
                phoneCode: userDetails.phoneCode || '',
                countryCode: userDetails.countryCode || '',
                about: userDetails.about || '',
                documents: [],
                role: userDetails.role || ''
            }
            var personal = await Personal.create(personalObj);
            return { value: personal };
        } else {
            return { error: { type: 'info', message: 'Personal object id is missing', location: { file: __filename, function: 'createPersonal' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'createPersonal' } } }
    }
}

module.exports = { createPersonal }