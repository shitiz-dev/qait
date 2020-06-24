
const ProfileService = require('./profile.service')
const WalletService = require('./wallet.service')
const CryptoService = require('./crypto.service')
const AuthDao = require('../dao/auth')
const NotificationService = require('./notification.service')
const VmUsersService = require('./vmusers.service');



function anonymousRegister(userDetails, creator, cb = () => { }) {
    let decryptedPassword = CryptoService.generateRandomString(8)
    const { name, email, miscellaneous } = userDetails
    // const decryptedPassword = CryptoService.decryptWithKey(password)
    const profileDetails = { ...userDetails, role: 'NORMAL_USER' }

    return VmUsersService.createUser({
        email,
        emailVerified: false,
        displayName: name,
        disabled: true
    }).then(userRecord => {

        const walletPromise = WalletService.instantiateWallet(decryptedPassword).then(walletDetails => {
            return walletDetails.error ? Promise.resolve({ error: walletDetails.error }) : WalletService.attachWallet(userRecord.uid, walletDetails.value, decryptedPassword)
        })
        const profilePromise = ProfileService.attachProfile(userRecord.uid, profileDetails)

        return Promise.all([profilePromise, walletPromise])
            .then(dbDocs => {
                if (dbDocs.every(Boolean)) {
                    const uid = userRecord.uid
                    // console.log('sending email for anonymous user', userRecord.email)
                    sendAnonymousRegisterationEmail(userRecord.email, creator)
                    return Promise.resolve({ value: uid })
                }
                else {
                    const err = new Error('Error registering profile')
                    return Promise.resolve({ error: err })
                }
            })
            .catch(err => {
                return Promise.resolve({ error: { type: 'info', message: `: ${err.message}`, location: { file: __filename, function: 'anonymousRegister' } } })
            })
    }).catch(err => {
        return Promise.resolve({ error: err })
    })

}



function sendAnonymousRegisterationEmail(registeredEmail, registerar, cb = () => { }) {
    let userRecord = null
    return VmUsersService.getUserByEmail(registeredEmail).then(user => {
        userRecord = user
        const fallbackUrl = `${process.env.APP_REST_PROTOCOL}://${process.env.APP_HOST}${process.env.APP_REST_BASE_URL}/verifyEmailLink`
        // console.log('fallbackUrl: ', fallbackUrl);

        if (userRecord.emailVerified) {
            return Promise.resolve(null)
        }
        return VmUsersService.generateEmailVerificationLink(userRecord.email, {
            url: fallbackUrl
        })
    }).then(async link => {

        if (link) {
            // console.log('link and generateToken', link)
            link = link.concat(`&email=${encodeURIComponent(userRecord.email)}&orgcreated=1`)
            const emailLink = new URL(link)
            var emailLinkSearchParams = emailLink.search;
            const encryptedEmailLinkCode = CryptoService.encryptWithKey(emailLinkSearchParams)
            const updateActionCode = await AuthDao.updateActionCode({ emailId: registeredEmail, actionCode: encryptedEmailLinkCode })

            if (updateActionCode.value) {
                const verificationLink = emailLink.origin + emailLink.pathname + `?actionCode=${encodeURIComponent(encryptedEmailLinkCode)}`
                // console.log('verificationLink: ', verificationLink);
                return NotificationService.sendEmailNotification({
                    to: userRecord.email,
                    type: 'ANONYMOUS_EMAIL_VERIFY',
                    data: {
                        name: userRecord.displayName,
                        link: verificationLink,
                        creator: registerar
                    }
                })
            }
            else {
                return Promise.resolve({ value: null })
            }
        } else {
            return Promise.resolve({ value: null })
        }
    }).then(sent => {
        cb(sent.error, sent.value)
        return Promise.resolve(sent)
    }).catch(error => {
        // console.log(error)
        cb({ type: 'error', ...error.spread(), location: { file: __filename, function: 'sendAnonymousRegisterationEmail' } })
        return Promise.resolve({ error })
    })
}


module.exports = { anonymousRegister }



