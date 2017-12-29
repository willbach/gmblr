const transactionRepository = require('../repositories/transaction.repository')
const creditProtocolUtil = require('../utils/credit.protocol.util')

const transactionService = {}

transactionService.storeTransaction = (signature, transaction) => {
    if(transaction.creditorAddress === transaction.debtorAddress) {
        throw new Error('Creditor and Debtor addresses must be different')
    }
    if(!creditProtocolUtil.verifySignature(signature, transaction)) {
        throw new Error('Invalid Signature')
    }

    return transactionRepository.getPendingTransaction(transaction)
    .then( (matchingTransaction) => {
        //write transaction if matching pending transaction already exists for opposite party
        if(matchingTransaction)
        return transactionRepository.writeTransaction(transaction)
    })
    .catch( (err) => {
        return transactionRepository.holdTransaction(transaction, signature) //hold transaction if match is not pending, and indicate which party signed it
    })
    .catch( (err) => {
        //hold failed
    })
}

transactionService.getTransactions = (addr) => {

}

transactionService.getPending = (addr) => {
    
}

module.exports = transactionService
