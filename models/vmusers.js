const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const timestamps = require('mongoose-timestamp')

const vmUsers = new Schema({
    email:String,
    password:String,
    displayName: String,
    verified:{ type: Boolean, default: false },
    verificationLink:String,
    passwordResetREquired:{ type: Boolean, default: false },
    disabled:{ type: Boolean, default: true },//changed enable to disabled as per requirement 
    deleted:{ type: Boolean, default: false },
    resetPasswordLink:{ type: Boolean, default: false },
    role:{ type: Boolean, default: false },
    createdBy:{ type: String, default: '' },
    updatedBy:String,
    walletId:String,
    companyId:String,
    profileId:String
})
vmUsers.index({ email: 1 }, { unique: true })
vmUsers.plugin(timestamps)

module.exports = vmUsers