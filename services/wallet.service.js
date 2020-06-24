const wallet = require('eth-lightwallet')
const CryptoService = require('./crypto.service')
const WalletDao = require('./../dao/wallet')


async function attachWallet(uid, walletDetails, key, cb = () => { }) {
    // console.log('attaching Wallet')

    const { seed, address, pubKey } = walletDetails
    const encryptedKey = CryptoService.encryptWithKey(key)
    var walletObj = await WalletDao.createWallet({ uid, seed, address, pubKey, key: encryptedKey })

    if (walletObj.value) {
        cb(null, walletObj.value)
        return Promise.resolve({ value: walletObj.value })
    } else {
        cb(walletObj.error)
        return Promise.resolve({ error: walletObj.error })
    }
}

const instantiateWallet = (password, seed = null, cb = () => { }) => {

    const walletPromise = loadKeyStore(password, seed).then(keyStore => {
        if (keyStore.error) {
            return Promise.resolve({ error: keyStore.error });
        }
        const { ks, seed } = keyStore.value

        let interimPromise = null;
        return new Promise(resolve => {
            ks.keyFromPassword(password, async (error, pwDerivedKey) => {
                if (error) {
                    resolve({ error });
                } else {
                    const address = await newAddresses(ks, password);
                    const pubKey = wallet.encryption.addressToPublicEncKey(ks, pwDerivedKey, address);
                    cb(null, ks, seed, address, pubKey);
                    resolve({ value: { ks, seed, address, pubKey } });
                }
            });
        })

    }).catch(err => {
        return Promise.resolve({ error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'instantiateWallet' } } })
    })

    return walletPromise
}

const loadKeyStore = (password, seed = null, encryption = true) => {
    let finalEncryptedSeed = null;
    let finalDecryptedSeed = null;
    if (seed && seed.trim().length) {
        const decryptedSeed = encryption ? CryptoService.decryptWithKey(seed, password.trim()) : seed;
        const seedValid = verifySeed(decryptedSeed);
        if (seedValid) {
            finalEncryptedSeed = seed;
            finalDecryptedSeed = decryptedSeed;
        } else {
            return Promise.resolve(false)
        }
    } else if (password && password.trim().length) {
        const extraEntropy = password.split('').reverse().join('');
        finalDecryptedSeed = wallet.keystore.generateRandomSeed(extraEntropy);
        finalEncryptedSeed = CryptoService.encryptWithKey(finalDecryptedSeed, password.trim());
    }

    return new Promise((resolve, reject) => {
        wallet.keystore.createVault({
            password: password,
            seedPhrase: finalDecryptedSeed,
            hdPathString: `m/0'/0'/0'`
        }, (err, ks) => {
            if (err) {
                resolve({ error: err });
            }
            resolve({ value: { ks, seed: finalEncryptedSeed } })
        })
    }).catch(error => {

        return Promise.resolve({ error: { type: 'error', ...error.spread(), location: { file: __filename, function: 'loadKeyStore' } } })
    })
}

const newAddresses = (ks, password, cb = () => { }) => {
    const keystore = ks;
    return new Promise((resolve, reject) => {
        if (keystore) {
            keystore.keyFromPassword(password, function (err, pwDerivedKey) {
                if (err) {
                    reject(null);
                }
                keystore.generateNewAddress(pwDerivedKey, 0);
                const addresses = keystore.getAddresses();
                resolve(addresses[0]);
            });
        } else {
            reject(null);
        }
    });
}

const verifySeed = (seed) => {
    try {
        return wallet.keystore.isSeedValid(seed);
    } catch (error) {
        return false;
    }
}

const derivePasswordKey = (ks, password) => {
    return new Promise(resolve => {
        ks.keyFromPassword(password, (error, pwDerivedKey) => {
            if (!error) {
                resolve({ value: pwDerivedKey });
            } else {
                resolve({ error });
            }
        });
    })
}
async function getBriefWallet(uid, cb = () => { }) {
    let walletResult = await WalletDao.getBriefWallet(uid)
    console.log('get brief wallet result', walletResult, uid)
    if (walletResult && walletResult.value) {
        const wallet = walletResult.value;
        cb(null, wallet)
        return Promise.resolve({ value: { address: wallet.address, pubKey: wallet.pubKey } })
    } else {
        cb(walletResult.error)
        return Promise.resolve({ error: walletResult.error })
    }
}

const walletRSAEncrypt = async (text, password, seed, pubKey, address) => {

    const { value } = await loadKeyStore(password, seed)
    if (value) {

        const pwDerivedKey = await derivePasswordKey(value.ks, password)
        value.ks.generateNewAddress(pwDerivedKey.value);
        const encrypted = wallet.encryption.asymEncryptString(value.ks, pwDerivedKey.value, text, address, pubKey);
        return encrypted
    }

}

module.exports = {
    attachWallet,
    instantiateWallet,
    getBriefWallet,
    walletRSAEncrypt
}