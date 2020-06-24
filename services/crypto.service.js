const AES = require('crypto-js/aes')
const MD5 = require('crypto-js/md5')
const Utf8 = require('crypto-js/enc-utf8')
const Hex = require('crypto-js/enc-hex')
const Word = require('crypto-js/lib-typedarrays')


const encryptWithKey = (text, key = process.env.APP_SECRET) => {
    try {
        return AES.encrypt(text, key).toString();
    } catch (error) {
        return '';
    }
}

const decryptWithKey = (encryptedText, key = process.env.APP_SECRET) => {
    try {
        return AES.decrypt(encryptedText, key).toString(Utf8);
    } catch (error) {
        return '';
    }
}

const hash = (message) => {
    try {
        return MD5(message).toString(Hex);
    } catch (error) {
        return '';
    }
}

const generateRandomString = (len = 6) => {
    // const random = Math.random().toString(36)
    // return random.substring(random.length - len)
    return Word.random(len).toString()

}



module.exports = {
    encryptWithKey, decryptWithKey, hash, generateRandomString
}