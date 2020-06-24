const TransactionsSchema = require('../models/transaction');
var mongoose = require('mongoose')

const Transaction = mongoose.model('transaction', TransactionsSchema);

async function createTransaction(transactionRecords) {
    try {
        const transactionObj = {
            senderWallet: transactionRecords.senderWallet,
            functionCode: transactionRecords.functionCode,
            stateCode: transactionRecords.stateCode,
            nonce: transactionRecords.nonce || 0,
            documentId: transactionRecords.documentId || null,
            payload: transactionRecords.payload || {},
            referenceId: transactionRecords.referenceId,
            operationalLock: false,
            postProcessEvent: transactionRecords.postProcessEvent || '',
            postProcessingPayload: transactionRecords.postProcessingPayload || {},
            deleted: false
        }
        const transactionRecord = await Transaction.create(transactionObj);
        return { value: transactionRecord };
    } catch (err) {
        return { error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'uploadTransaction' } } }
    }
}

module.exports = { createTransaction }