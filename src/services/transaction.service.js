const transactionRepository = require('../repositories/transaction.repository')
const creditProtocolUtil = require('../utils/credit.protocol.util')
const transactionDTO = require('../dto/transaction.dto')

const transactionService = {}

transactionService.storeTransaction = (transaction, signature) => {
    if(transaction.creditorAddress === transaction.debtorAddress) {
        throw new Error('WRITE_ERROR: Creditor and Debtor addresses must be different')
    }

    const sigType = creditProtocolUtil.determineSigner(transaction, signature)

    if(!sigType) {
        throw new Error('WRITE_ERROR: Invalid Signature')
    }

    return transactionRepository.getPendingTransaction(transaction)
    .then( (matchingTransaction) => {
        //hold transaction if there is not already a matching transaction
        //write transaction if matching pending transaction already exists for opposite party
        //update the held transaction if the same party is submitting a new transaction
        if(!matchingTransaction) {
            console.log('HERE 1')
            return transactionRepository.holdTransaction(transaction, signature, sigType)
        } else if(matchingTransaction.creditorSignature !== null && sigType === 'debtor') {
            console.log('HERE 2')
            return transactionRepository.writeTransaction(transaction, matchingTransaction.creditorSignature, signature)
        } else if(matchingTransaction.debtorSignature !== null && sigType === 'creditor') {
            console.log('HERE 3')
            return transactionRepository.writeTransaction(transaction, signature, matchingTransaction.debtorSignature)
        } else {
            console.log('HERE 4')
            matchingTransaction.transaction = transaction
            if(matchingTransaction.creditorSignature !== null && sigType === 'creditor') {
                matchingTransaction.creditorSignature = signature
            } else if(matchingTransaction.debtorSignature !== null && sigType === 'debtor') {
                matchingTransaction.debtorSignature = signature
            }
            return matchingTransaction.save().then( (data) => 'UPDATED' )
        }
    })
    .catch( (err) => {
        return `WRITE_ERROR: NO MATCHING TRANSACTION FOUND - ${err}`
    })
}

transactionService.getTransactions = (addr) => {
    return transactionRepository.getAllTransactions(addr).then( (addresses) => {
        console.log('HERE 1')
        //fix this
        return addresses === null ? [] : addresses.map(transactionDTO)
    })
}

transactionService.getPending = (addr) => {
    return transactionRepository.getAllPending(addr)
}

transactionService.deleteTransaction = (transaction, signature) => {
    const sigType = creditProtocolUtil.determineSigner(transaction, signature)

    if(!sigType) {
        throw new Error('Invalid Signature')
    }

    return transactionRepository.getPendingTransaction(transaction)
    .then( (matchingTransaction) => {
        if(!matchingTransaction) {
            throw new Error('No Matching Transaction')
        } else if( matchSignature(matchingTransaction, signature, sigType) ) {
            return transactionRepository.deleteTransaction(matchingTransaction)
            .then( (success) => {
                return 'DELETED'
            })
        } else {
            throw new Error('Invalid Signature')
        }
    })
}

function matchSignature(matchingTransaction, signature, sigType) {
    return ( matchingTransaction.creditorSignature === signature && sigType === 'creditor' ) || ( matchingTransaction.debtorSignature === signature && sigType === 'debtor' ) 
}

module.exports = transactionService
