const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
mongoose.createConnection('mongodb://localhost/gamblr', {
    useMongoClient: true
})
mongoose.connect('mongodb://localhost/gmblr')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('TRANSACTION SCHEMA CONNECTED')
});

const Schema = mongoose.Schema
const TransactionSchema = new Schema({
    creditorSignature: String,
    debtorSignature: String,
    transaction: Object,
    sequence: Number,
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Transaction', TransactionSchema)
