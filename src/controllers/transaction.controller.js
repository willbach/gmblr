const transactionService = require('../services/transaction.service')

const transactionController = {}

transactionController.storeTransaction = (req, res) => {
    transactionService.storeTransaction(req.body.transaction, req.body.signature)
    .then( (data) => {
        res.status(200).end(`TRANSACTION_${data}`)
    })
    .catch( (err) => {
        console.error('TRANSACTION_WRITE_ERROR:', err)
        res.status(503).end('TRANSACTION_WRITE_ERROR')
    })
}

transactionController.getTransactions = (req, res) => {
    transactionService.getTransactions(req.query.addr)
    .then( (transactions) => {
        res.json(transactions)
    })
    .catch( (err) => {
        console.error('TRANSACTION_GET_ERROR:', err)
        res.status(503).end('TRANSACTION_GET_ERROR')
    })
}

transactionController.getPending = (req, res) => {
    transactionService.getPending(req.query.addr)
    .then( (transactions) => {
        res.json(transactions)
    })
    .catch( (err) => {
        console.error('GET PENDING ERROR:', err)
        res.status(503).end(err)
    })
}

transactionController.deleteTransaction = (req, res) => {
    transactionService.deleteTransaction(req.body.transaction, req.body.signature)
    .then( (data) => {
        res.status(200).end(`TRANSACTION_${data}`)
    })
    .catch( (err) => {
        console.error('TRANSACTION_DELETE_ERROR:', err)
        res.status(503).end(`TRANSACTION_DELETE_ERROR: ${err}`)
    })
}

module.exports = transactionController
