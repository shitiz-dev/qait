const CryptoService = require('./crypto.service')
const vmUsersDao = require('../dao/vmusers')
const formatvalidation = require('../utils/formatvalidation.js')

async function createUser({ email, emailVerified, displayName, disabled, phoneNumber }) {
    try {
        if (formatvalidation.validateEmailFormat(email)) {
            const createUserRes = await vmUsersDao.createUser({ email, emailVerified, displayName, disabled, phoneNumber })

            if (createUserRes.error) {
                throw createUserRes.error

            }
            return createUserRes
        }
        throw new Error("Invalid Email Format")
    }
    catch (err) {
        throw err

    }
}

async function getUserByEmail(email) {
    try {
        const getUserRes = await vmUsersDao.getUserByEmail(email)
        if (getUserRes.error) {
            throw getUserRes.error

        }
        return getUserRes
    }
    catch (err) {
        throw err
    }
}



async function getUser(uid) {
    try {
        const getUserRes = await vmUsersDao.getUser(uid)
        if (getUserRes.error) {
            throw getUserRes.error
        }
        return getUserRes
    }
    catch (err) {

        throw err
    }
}

async function updateUser(uid, updateRecord) {
    try {
        const updateUserRes = await vmUsersDao.updateUser(uid, updateRecord)
        if (updateUserRes.error) {
            throw updateUserRes.error
        }
        return updateUserRes

    }
    catch (err) {
        throw err

    }

}

async function generateEmailVerificationLink(email, url) {
    try {
        // console.log("in email link")
        if (email) {
            try {
                const userDetails = await vmUsersDao.getUserByEmail(email);
                const vmUserId = userDetails.uid;
                const verificationLink = process.env.NODE_ENV === 'development' ? `${process.env.APP_REST_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}` : `${process.env.APP_REST_PROTOCOL}://${process.env.APP_HOST}`
                // const verificationLink = `${process.env.APP_REST_PROTOCOL}://${process.env.APP_HOST}:${process.env.APP_PORT}`
                //return url format as per firebase
                //http://localhost:3000/api/v1/verifyEmail?mode=verifyEmail&oobCode=nuKOm-E57VVz92t0D8DYa7_tdsrcyWEVeuaCWJTWvC8AAAFxeNK-4A&apiKey=AIzaSyDhDM2IhwYm4Mo7z2CPVwOfIxOxD10Rfoo&continueUrl=http%3A%2F%2Flocalhost%2Fapi%2Fv1%2FverifyEmailLink&lang=en&email=dockerdev%40yopmail.com
                const hash = await getHashForEmailLink(vmUserId)
                const emailLink = encodeURIComponent(url.url)
                const returnString = verificationLink + '/api/v1/verifyEmail?mode=verifyEmail&oobCode=' + hash + '&continueUrl=' + emailLink + '&lang=en'
                return returnString;
            }
            catch (err) {
                return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'generateEmailVerificationLink' } } }
            }

        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'generateEmailVerificationLink' } } }
    }
}
async function getHashForEmailLink(vmUserId) {
    try {
        return linkHash = CryptoService.hash(vmUserId + Date.now());
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'getHashForEmailLink' } } }
    }

}
async function getUserByPhoneNumber(phoneNumber) {
    try {
        const getUserRes = await vmUsersDao.getUserByPhoneNumber(phoneNumber)
        if (getUserRes.error) {
            throw getUserRes.error
        }
        return getUserRes

    }
    catch (err) {
        throw err
    }
}

module.exports = {
    generateEmailVerificationLink,
    createUser,
    getUserByEmail,
    getUser,
    getUserByPhoneNumber,
    updateUser

}