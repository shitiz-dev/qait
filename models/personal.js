const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

const PersonalSchema = new Schema({
	uid: String,
	profilePhotoHash: {
		default: null,
		type: String
	},
	about: String,
	document: [String],
	domain: { type: String, default: 'OTHERS' },
	email: String,
	id: String,
	location: String,
	name: String,
	phone: String,
	countryCode: String,
	phoneCode: String,
	role: String,
	emailVerified: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false }
})

PersonalSchema.plugin(timestamps)

module.exports = PersonalSchema;