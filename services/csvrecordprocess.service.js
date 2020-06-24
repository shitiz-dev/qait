const RegisterService = require('./register.service')
const TransactionsService = require('./transactions.service')
const WalletService = require('./wallet.service')
const IpfsService = require('./ipfs.service')
const CsvRecordService = require('./csvrecord.service')
const CryptoService = require('./crypto.service')
const VmUsersService = require('./vmusers.service');
const CertificateService = require('./certificate.service');
const CsvTemplateService = require('./csvtemplates.service');


const SQS = require('../utils/sqs')


let SQS_QUEUE_URL = null

async function pollQueueForMessages() {
    try {
        const queueURL = SQS_QUEUE_URL ? SQS_QUEUE_URL : await SQS.getQueueURL(process.env.APP_PREPROCESSOR_SQS)
        if (queueURL.err) throw queueURL.err
        else {
            if (!SQS_QUEUE_URL) SQS_QUEUE_URL = queueURL.value
            const queueMessages = await SQS.receiveQueueMessages(SQS_QUEUE_URL, process.env.APP_SQS_WAIT_TIME, process.env.APP_SQS_BATCH_SIZE)
            if (queueMessages.error) throw queueMessages.error
            else {

                const messages = queueMessages.value ? queueMessages.value : []
                console.log('number of messages received', messages.length, messages)
                await onrecieveQueueMessage(messages)
            }
        }
    }
    catch (err) {
        //console.log('error in polling messages', err)
    }
    finally {
        pollQueueForMessages()
    }
}

async function onrecieveQueueMessage(messages) {
    try {
        const promiseArray = messages.map(message => {
            // const JsonParseMessageBody = message.body
            const JsonParseMessageBody = JSON.parse(message.Body)
            const { csvRecord, uploaderWallet, fileData, uploadedBy } = JsonParseMessageBody
            return assignUserToRecord(csvRecord, uploaderWallet, fileData, uploadedBy)
        })

        await Promise.all(promiseArray)
            const deleteSQSMessagesPromises = []
            for (let i = 0; i < messages.length; i++) {
                deleteSQSMessagesPromises.push(SQS.deleteQueueMessage(SQS_QUEUE_URL, messages[i].ReceiptHandle))
            }
            await Promise.all(deleteSQSMessagesPromises)

    }
    catch (err) {
        //console.log('Error onrecieveQueueMessage', err)
    }
}


// This function is used to assign user to csv record.If user not exists it create a new user and assign it.
async function assignUserToRecord(rowMetaData, wallet, fileData, creator) {
    try {

        if (!rowMetaData.email) throw Error("Email not found")
        if (rowMetaData.email.trim().toLowerCase() === creator.email) throw Error("Cannot upload for your email:" + creator.email)
        // const registrationResult = await dummyData.getUSer(rowMetaData.email)
        const registrationResult = await RegisterService.anonymousRegister(rowMetaData, { email: creator.email, name: creator.displayName })
        if (registrationResult.error) {
            const err = registrationResult.error
            const errCode = ['auth/email-already-exists', 'auth/phone-number-already-exists']
            if (errCode.includes(err.code)) {
                const userFromAuth = await VmUsersService.getUserByEmail(rowMetaData.email)
                if (userFromAuth && userFromAuth.uid) {
                    registrationResult.value = userFromAuth.uid
                } else {
                    throw Error(`User with email ${rowMetaData.email} is not registered`)
                }
            } else {
                //console.log('registration result error', registrationResult.error)
                throw Error(registrationResult.error)
            }
        }
        //console.log('registrationResult', registrationResult)
        let resultTemp = await uploadRecordToIPFS(rowMetaData, creator, registrationResult.value, wallet, fileData)
        //console.log('assign user record result', resultTemp)
        return resultTemp
    } catch (error) {
        error = error.spread ? error : new Error(error)
        await CsvRecordService.saveCsvRecord(
            {
                csvRecord: rowMetaData.csvCertificate.csv,
                operationId: fileData.uploadOperationData._id,
                fileId: fileData.fileId,
                status: 'error',
                uploadedBy: wallet.uid,
                event: 'bulk_upload_error',
                error: { ...error.spread() }
            })
        //console.log({ type: 'error', ...error.spread() })
        return { error: error }
    }

}

//This function is to upload a single CSV record to IPFS
async function uploadRecordToIPFS(rowMetaData, creator, registrationResultValue, wallet, fileData) {
    try {
        //console.log('Row Data', rowMetaData)
        //console.log('File Data', fileData)
        // const { value } = await CsvTemplateService.loadCsvTemplate(fileData.uploadOperationData.templateId)
        // const TemplateUrl = `${process.env.APP_CERTIFICATE_BUCKET_BASE_URL}/${value.certificateTemplateName}`
        // const TemplateUrl = `${process.env.APP_CERTIFICATE_BUCKET_BASE_URL}/template1.docx`
        const template = 'template1.docx'
        const {value, error} = await CertificateService.generateCertificate(rowMetaData, template)
        let filePassword = CryptoService.generateRandomString(8)
        let encryptedText;
        // if(error){
        //     encryptedText = CryptoService.encryptWithKey(JSON.stringify(rowMetaData), filePassword)        
        // }else{
        //     //console.log('Data Url', value)
        //     encryptedText = CryptoService.encryptWithKey(value.dataUrl, filePassword)
        // }
        encryptedText = CryptoService.encryptWithKey(value.dataUrl, filePassword)
        const ipfsdata = {
            dataUrl: encryptedText,
            name: rowMetaData.name,
            type: error ? 'application/json' : 'application/pdf',
            size: error ? 0 : value.size, 
        }

        // console.log(ipfsdata)
        const ipfsUploadResult = await IpfsService.uploadDocumentToIpfs([ipfsdata])
        //console.log('ipfs upload result', ipfsUploadResult)
        if (ipfsUploadResult.value) {
            const tempResult = await storeRecordToBlockChain(registrationResultValue, creator, wallet, ipfsUploadResult, filePassword, rowMetaData, fileData)
            return tempResult;
        } else {
            throw Error(ipfsUploadResult.error)
        }
    } catch (error) {
        error = error.spread ? error : new Error(error)
        throw error
    }
}

//This function is to send record to trasnsaction DB so transaction server can process it.
async function storeRecordToBlockChain(selectedUserId, creator, wallet, ipfsUploadResult, filePassword, rowMetaData, fileData) {
    try {
        const selectedUserWallet = await WalletService.getBriefWallet(selectedUserId)
        if (selectedUserWallet.error) throw Error(selectedUserWallet.error ? selectedUserWallet.error.message : 'selectedUserWallet error')
        const password = CryptoService.decryptWithKey(wallet.key)
        const createrEncryptedPassword = await WalletService.walletRSAEncrypt(filePassword, password, wallet.seed, wallet.pubKey, wallet.address)
        const ownerEncryptedPassword = await WalletService.walletRSAEncrypt(filePassword, password, wallet.seed, selectedUserWallet.value.pubKey, wallet.address)
        const sourceEncryptedPassword = createrEncryptedPassword
        const transaction = {
            senderWallet: wallet,
            functionCode: "UPLOAD_DOCUMENT",
            documentId: 0,
            payload: {
                documentHash: ipfsUploadResult.value[0].hash,
                creatorPassword: sourceEncryptedPassword,
                ownerPassword: ownerEncryptedPassword,
                ownerAddress: selectedUserWallet.value.address,
                sourcePassword: '',
                sourceAddress: '',
                description: '',
                publicKey: wallet.pubKey,
                referenceId: fileData.fileId
            },
            referenceId: fileData.fileId,
            postProcessEvent: 'CSV_DOCUMENT_UPLOADED',
            postProcessingPayload: { selectedUserId, creator, wallet, ipfsHash: ipfsUploadResult.value[0].hash, filePassword, rowMetaData, fileData }
        }
        const reciept = await TransactionsService.createTransaction(transaction);
        if (reciept.error) throw reciept.error
        return { value: reciept.value }
    } catch (error) {
        error = error.spread ? error : new Error(error)
        await CsvRecordService.saveCsvRecord(
            {
                csvRecord: rowMetaData.csvCertificate.csv,
                operationId: fileData.uploadOperationData._id,
                fileId: fileData.fileId,
                status: 'error',
                uploadedBy: wallet.uid,
                event: 'bulk_upload_error',
                error: { ...error.spread() }
            })
        //console.log({ type: 'error', ...error.spread() })
        return { error: error }
    }
}


module.exports = { pollQueueForMessages, onrecieveQueueMessage }
