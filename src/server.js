const PORT = 3000
const app = require('express')()

// const moment = require('moment')
const path = require('path')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}), bodyParser.json())

//controllers
const transactionController = require('./controllers/transaction.controller')
const nonceController = require('./controllers/nonce.controller')
const userController = require('./controllers/user.controller')

//routes
app.get('/helloworld', (req, res) => res.end('hello world'))

app.get('/transaction', transactionController.getTransactions)
app.post('/transaction', transactionController.storeTransaction)
app.delete('/transaction', transactionController.deleteTransaction)
app.get('/pending', transactionController.getPending)

app.get('/nonce/:address1/:address2', nonceController.getNonce)

app.get('/nickname', userController.getNickname)
app.post('/nickname', userController.storeNickname)
// app.delete('/nickname', userController.deleteNickname)

//error handling
app.use( (req, res, next) => res.status(404).send("Resource Not Found") )

app.use( (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Server Error')
})

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))

module.exports = app
