const transactionService = require('../services/transaction.service')

const transactionController = {}

transactionController.storeTransaction = (req, res) => {
    transactionService.storeTransaction(req.body.signature, req.body.transaction)
    .then( (data) => {
        res.status(200).end('Transaction Stored')
    })
    .catch( (err) => {
        console.error('STORE TRANSACTION ERROR:', err)
        res.end(err)
    })
}

transactionController.getTransactions = (req, res) => {

}

transactionController.getPending = (req, res) => {

}

module.exports = transactionController
