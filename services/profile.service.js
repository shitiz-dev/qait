// const admin = require('firebase-admin')
// const auth = admin.auth()
const PersonalDao = require('./../dao/personal');
const UserDao = require('./../dao/user');
const VmUsersService = require('./vmusers.service');





function attachProfile(uid, userDetails, createdBySelf, cb = () => { }) {

    // attaching profile to existing authenticated users 

    return VmUsersService.getUser(uid).then((userRecord) => {
        return updateUser(uid, userDetails, userRecord)
    }).then(async userRecord => {

        uid = userRecord.value
        const personalObj = {
            uid: uid,
            name: userDetails.name || '',
            location: userDetails.location || '',
            email: userDetails.email || '',
            phone: userDetails.phone || '',
            countryCode: userDetails.countryCode || '',
            phoneCode: userDetails.phoneCode || '',
            about: userDetails.about || '',
            documents: [],
            role: userDetails.role || ''
        }
        var personal = await PersonalDao.createPersonal(personalObj);

        if (personal.value && !personal.error) {
            const userObj = {
                uid: uid,
                personal: [personal.value._id],
                education: [],
                experience: [],
                skills: [],
                role: userDetails.role,
                searchCount: 0,
                viewCount: 0,
                authenticityLevel: 0
            }
            if (!createdBySelf) {
                userObj.createdBy = userDetails.createdBy || ''
            }
            userObj.passwordReset = !createdBySelf
            // console.log('attaching profile', userObj)
            const user = await UserDao.createUser(userObj);
            if (user.value) {
                return Promise.resolve({ value: user.value })
            } else {
                return Promise.resolve({ error: user.error })
            }
        } else {
            return Promise.resolve({ error: personal.error })
        }

    }).catch(error => {
        error = error.spread ? { ...error.spread() } : error
        // console.log('Profile attachment error:', error);
        cb({ type: 'error', ...error, location: { file: __filename, function: 'attachProfile' } })
        return Promise.resolve({ error: { type: 'info', message: `${userDetails.phone} : ${error.message}`, location: { file: __filename, function: 'attachProfile' } } })
    })
}

function updateUser(uid, updated, original = null, cb = () => { }) {
    const { email, phoneCode, phone, emailVerified, name, photoUrl, disabled } = updated
    const phoneNumber = (phone && phoneCode) ? phoneCode.concat(phone) : null
    if (!Object.values(updated).some(Boolean)) {
        cb({ type: 'info', message: 'Cannot update user to null', location: { file: __filename, function: 'updateUser' } })
        return Promise.resolve({ error: { type: 'info', message: 'Cannot update user to null', location: { file: __filename, function: 'updateUser' } } })
    }
    const updatedRecordPromise = original ? Promise.resolve({
        email: email || original.email,
        phoneNumber: phoneNumber || original.phoneNumber,
        emailVerified: emailVerified || original.emailVerified,
        disabled: typeof disabled !== 'undefined' ? disabled : original.disabled,
        displayName: name || original.displayName,
        photoURL: photoUrl || original.photoURL
    }) : VmUsersService.getUser(uid).then(userRecord => {
        //const { name, email, photoUrl, phone } = details
        const record = {
            email: email || userRecord.email,
            phoneNumber: phoneNumber || userRecord.phoneNumber,
            emailVerified: emailVerified || userRecord.emailVerified,
            disabled: typeof disabled !== 'undefined' ? disabled : original.disabled,
            displayName: name || userRecord.displayName,
            photoURL: photoUrl || userRecord.photoURL
        }
        return Promise.resolve(record)
    })
    return updatedRecordPromise.then(updateRecord => {
        return VmUsersService.updateUser(uid, updateRecord)
    }).then(userRecord => {
        cb(null, userRecord.uid)
        return Promise.resolve({ value: userRecord.uid })
    }).catch(error => {
        error = error.spread ? { ...error.spread() } : error

        cb({ type: 'error', ...error, location: { file: __filename, function: 'updateUser' } })
        return Promise.resolve({ error: { type: 'error', ...error, location: { file: __filename, function: 'updateUser' } } })
    })
}

module.exports = { attachProfile }