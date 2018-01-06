const Transaction = require('../entities/Transaction')

const transactionRepository = {}

transactionRepository.getAllTransactions = (address) => {
    return Transaction.find({
        $or: [
            {'transaction.creditorAddress': address},
            {'transaction.debtorAddress': address}
        ]
    })
}

transactionRepository.getAllPending = (address) => {
    return Transaction.find({
        $and: [
            {$or: [
                {'transaction.creditorAddress': address},
                {'transaction.debtorAddress': address}
            ]},
            {$or: [
                {'creditorSignature': null},
                {'debtorSignature': null}
            ]}
        ]
    })
}

transactionRepository.getPendingTransaction = (transaction) => {
    return Transaction.findOne({
        $and: [
            {'transaction.creditorAddress': transaction.creditorAddress},
            {'transaction.debtorAddress': transaction.debtorAddress},
            {'transaction.nonce': transaction.nonce},
            {$or: [
                {'creditorSignature': null},
                {'debtorSignature': null}
            ]}
        ]
    })
}

transactionRepository.holdTransaction = (transaction, signature, sigType) => {
    const newTransaction = new Transaction({
        transaction: transaction,
        creditorSignature: null,
        debtorSignature: null
    })
    
    if(sigType === 'creditor') {
        newTransaction.creditorSignature = signature
    } else {
        newTransaction.debtorSignature = signature
    }

    return newTransaction.save().then( (data) => 'STORED' )
}

transactionRepository.writeTransaction = (transaction) => {
    return 'WRITTEN'
}

transactionRepository.deleteTransaction = (transaction) => {
    return transaction.remove()
}

module.exports = transactionRepository
