const TransactionsDAO = require('../dao/transaction')

async function createTransaction(transaction) {
    transactionObj = {

        senderWallet: transaction.senderWallet,
        functionCode: transaction.functionCode,
        documentId: transaction.documentId || null,
        payload: transaction.payload,
        postProcessEvent: transaction.postProcessEvent || '',
        postProcessingPayload: transaction.postProcessingPayload || {},
        referenceId: transaction.referenceId,
        operationalLock: false,
        deleted: false
    }

    try {
        const createTransaction = await TransactionsDAO.createTransaction(transactionObj)
        if (createTransaction.error) return { error: createTransaction.error }
        return { value: createTransaction.value }
    } catch (error) {
        return { error: { type: 'error', ...error.spread(), location: { file: __filename, function: 'loadProfile' } } }
    }
}

module.exports = {
    createTransaction
}