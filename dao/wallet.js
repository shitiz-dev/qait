const WalletSchema = require('../models/wallet');
const mongoose = require('mongoose')
const Wallet = mongoose.model('wallet', WalletSchema)


async function createWallet(walletDetails) {
    try {
        if (walletDetails && walletDetails.address && walletDetails.key && walletDetails.pubKey && walletDetails.seed && walletDetails.uid) {
            var walletObj = {
                address: walletDetails.address,
                key: walletDetails.key,
                pubKey: walletDetails.pubKey,
                seed: walletDetails.seed,
                uid: walletDetails.uid
            }
            var wallet = await Wallet.create(walletObj);
            return { value: wallet };
        } else {
            return { error: { type: 'info', message: 'Wallet information is missing.', location: { file: __filename, function: 'createWallet' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'createWallet' } } }
    }
}
async function getBriefWallet(uid) {
    try {
        if (uid) {
            var wallet = await Wallet.findOne({ deleted: false, uid: uid }).select('address pubKey');;
            return { value: wallet };
        } else {
            return { error: { type: 'info', message: 'User UID is missing', location: { file: __filename, function: 'getBriefWallet' } } }
        }
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'getBriefWallet' } } }
    }
}


module.exports = { createWallet, getBriefWallet }