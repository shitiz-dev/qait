const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')


const User = new Schema({
	uid: String,
	personal: [{ type: Schema.Types.ObjectId, ref: 'personal' }],
	education: [Object],
	experience: [Object],
	skills: [Object],
	role: String,
	searchCount: Number,
	viewCount: Number,
	createdBy: String,
	authenticityLevel: Number,
	passwordResetRequired: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false }
})
User.plugin(timestamps)

module.exports = User