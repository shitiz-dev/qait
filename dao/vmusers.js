const vmUsersSchema = require('../models/vmusers');
const mongoose = require('mongoose')
const VmUsers = mongoose.model('vmUsers', vmUsersSchema)

async function createUser(userObj) {
    try {
        if (userObj.email && userObj.displayName) {
            const exists = await VmUsers.find({ deleted: false, email: userObj.email }).count();
            if (exists == 0) {
                const user = await VmUsers.create(userObj);
                const returnValue = {
                    disabled: user.disabled,
                    email: user.email,
                    emailVerified: user.verified,
                    phoneNumber: '',
                    uid: user._id,
                    displayName: userObj.displayName
                }
                return returnValue;
            }
            else {
                return { error: { type: 'info', message: 'User Already Exists', code: 'auth/email-already-exists', location: { file: __filename, function: 'createUser' } } }
            }

        } else {
            return { type: 'info', message: 'Personal object is missing', location: { file: __filename, function: 'createUser' } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'createUser' } } }
    }
}
async function getUserByEmail(email) {
    if (email) {
        const user = await VmUsers.findOne({ deleted: false, email: email }).lean();
        if (user) {
            const returnValue = {
                disabled: user.disabled,
                email: user.email,
                emailVerified: user.verified,
                phoneNumber: '',
                uid: user.uid ? user.uid : user._id,
                displayName: user.displayName
            }
            return returnValue;
        } else
            throw Error({ type: 'info', message: 'User doesnot exist', location: { file: __filename, function: 'getUserByEmail' } })

    } else {
        throw Error({ type: 'info', message: 'Email not entered', location: { file: __filename, function: 'getUserByEmail' } })
    }
}

async function getUser(uid) {
    try {
        if (uid) {
            let user;
            if(mongoose.Types.ObjectId.isValid(uid)){
                 user = await VmUsers.findOne({ deleted: false, _id:uid}).lean();
            }else{
                 user = await VmUsers.findOne({ deleted: false,  uid:uid }).lean();
            }
            const returnValue = {
                disabled: user.disabled,
                email: user.email,
                emailVerified: user.verified,
                phoneNumber: '',
                uid: user.uid ? user.uid : user._id,
                displayName: user.displayName
            }
            return returnValue;
        } else {
            return { error: { type: 'info', message: 'User doesnot exist', location: { file: __filename, function: 'getUser' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'getUser' } } }
    }
}

//this function has been deliberately left with error so that it does not cause bug in existing code
async function getUserByPhoneNumber(phoneNumber) {
    try {
        if (phoneNumber) {
            const user = await VmUsers.findOne({ deleted: false, phoneNumber: phoneNumber });
            const returnValue = {
                disabled: user.disabled,
                email: user.email,
                emailVerified: user.verified,
                phoneNumber: phoneNumber,
                uid: user.uid ? user.uid : user._id,
                displayName: user.displayName
            }
            return returnValue;
        } else {
            return { error: { type: 'info', message: 'User doesnot exist', location: { file: __filename, function: 'getUserByPhoneNumber' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'getUserByPhoneNumber' } } }
    }
}
async function updateUser(uid, updateRecord) {
    try {
        if (uid) {
            const userDetail = await getUser(uid);
            if (updateRecord.email && updateRecord.email !== userDetail.email) {
                return { error: { type: 'info', message: 'Email cannot be changed from here', location: { file: __filename, function: 'updateUser' } } }
            } else {
                const user = await VmUsers.updateOne({ $or: [{ _id: uid }, { uid: uid }], deleted: false }, { $set: updateRecord });
                const returnValue = {
                    disabled: userDetail.disabled,
                    email: userDetail.email,
                    emailVerified: userDetail.emailVerified,
                    phoneNumber: '',
                    uid: userDetail.uid,
                    displayName: user.displayName
                }
                return returnValue;
            }

        } else {
            return { error: { type: 'info', message: 'User UID is missing or data not formatted properly', location: { file: __filename, function: 'updateUser' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'updateSkills' } } }
    }
}

module.exports = {
    createUser,
    getUserByEmail,
    getUser,
    getUserByPhoneNumber,
    updateUser

}