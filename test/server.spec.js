const assert = require('assert')
const request = require('supertest')
const server = require('../src/server.js')
const ethUtil = require('ethereumjs-util')
const creditProtocolUtil = require('../src/utils/credit.protocol.util')
const bufferUtil = require('../src/utils/buffer.util')

const User = require('../src/entities/User')
const Transaction = require('../src/entities/Transaction')

describe('GET /helloworld', function() {
  it('should respond with "hello world"', function(done) {
    request(server).get('/helloworld').expect('hello world', done)
  })
})

describe('HTTP Server', function() {
  const creditorPrivateKeyBuffer = bufferUtil.hexToBuffer('540a5e193cebd774a1af02723ba5798d7ff2dec454a56bcd07aa5cf0e6d94ce7')
  const debtorPrivateKeyBuffer = bufferUtil.hexToBuffer('8e3d087953bf3190e06d827a55b13020f97028885d5307584762779290940bf2')

  const transaction1 = {
    creditorAddress: '20347f5b106c870649737930a01841d7ac9ed94c',
    debtorAddress: 'f2f44df194f812f3ab8eabf9d331f6344edf6ec1',
    ucacAddress: '20347f5b106c870649737930a01841d7ac9ed94e',
    amount: 200,
    memo: 'Giants win by 3',
    nonce: 0
  }

  transaction1.buffer = Buffer.concat([
    bufferUtil.hexToBuffer(transaction1.ucacAddress),
    bufferUtil.hexToBuffer(transaction1.creditorAddress),
    bufferUtil.hexToBuffer(transaction1.debtorAddress),
    bufferUtil.int32ToBuffer(transaction1.amount),
    bufferUtil.int32ToBuffer(transaction1.nonce)
  ])
  
  transaction1.hash = ethUtil.sha3(transaction1.buffer)

  const signature1 = generateSignature(transaction1.hash, creditorPrivateKeyBuffer)
  
  const data1 = {
    transaction: transaction1, 
    signature: signature1
  }

  const transaction2 = {
    creditorAddress: '20347f5b106c870649737930a01841d7ac9ed94c',
    debtorAddress: 'f2f44df194f812f3ab8eabf9d331f6344edf6ec1',
    ucacAddress: '20347f5b106c870649737930a01841d7ac9ed94e',
    amount: 200,
    memo: 'Giants win by 3',
    nonce: 0
  }

  transaction2.buffer = Buffer.concat([
    bufferUtil.hexToBuffer(transaction2.ucacAddress),
    bufferUtil.hexToBuffer(transaction2.creditorAddress),
    bufferUtil.hexToBuffer(transaction2.debtorAddress),
    bufferUtil.int32ToBuffer(transaction2.amount),
    bufferUtil.int32ToBuffer(transaction2.nonce)
  ])
  
  transaction2.hash = ethUtil.sha3(transaction2.buffer)

  const signature2 = generateSignature(transaction2.hash, debtorPrivateKeyBuffer)
  
  const data2 = {
    transaction: transaction2, 
    signature: signature2
  }

  describe.only('/transaction', function() {
    it('GET should return empty array if there are no transactions', function(done) {
      const address = '20347f5b106c870649737930a01841d7ac9ed94c'
      request(server).get(`/transaction?addr=${address}`).expect([], done)
    })

    it('DELETE should send an error if there is no matching transaction', function(done) {
      request(server).delete('/transaction').send(data1).expect(503).expect('TRANSACTION_DELETE_ERROR: Error: No Matching Transaction', done)
    })

    it('POST should respond with "TRANSACTION_STORED" if there is not a pending match', function(done) {
      request(server).post('/transaction').send(data1).expect('TRANSACTION_STORED', done)
    })

    it('POST should respond with "TRANSACTION_UPDATED" if there is a pending match', function(done) {
      data1.transaction.amount = 400
      request(server).post('/transaction').send(data1).expect('TRANSACTION_UPDATED', done)
    })

    it('GET should respond with all transactions for the user', function(done) {
      const address = '20347f5b106c870649737930a01841d7ac9ed94c'
      request(server).get(`/transaction?addr=${address}`).expect(
        [{ 
          transaction: {
            nonce: 0,
            memo: 'Giants win by 3',
            amount: 400,
            ucacAddress: '20347f5b106c870649737930a01841d7ac9ed94e',
            debtorAddress: 'f2f44df194f812f3ab8eabf9d331f6344edf6ec1',
            creditorAddress: '20347f5b106c870649737930a01841d7ac9ed94c'
          },
          creditorSignature: '1cb84f182dd64411f40ebc66b27d341cf6bb75bc79edbba5db4c1c093f53b3c63cb39e9c6a536a96b28cb5a87f3b31347542efb2e18f847f3b5075683d7427271c',
          debtorSignature: null
        }]
      , done)
    })
  
    it('POST should respond with "TRANSACTION_WRITTEN" if there is a pending counterpart', function(done) {
      request(server).post('/transaction').send(data1).end(function() {
        request(server).post('/transaction').send(data2).expect('TRANSACTION_WRITTEN', done)
      })
    })

    it('DELETE should remove a specific transaction', function(done) {
      request(server).delete('/transaction').send(data1).expect('TRANSACTION_DELETED', done)
    })
  })

  describe('/nickname', function() {
    it('GET should send 404 if nickname does not exist', function(done) {
      const address = '20347f5b106c870649737930a01841d7ac9ed94c'
      request(server).get(`/nickname?addr=${address}`).expect(404, done)
    })

    it('POST should set the nickname for a given user', function(done) {
      const nickname = 'Billy'
      const address = '20347f5b106c870649737930a01841d7ac9ed94c'
      const data = {address, nickname}
      request(server).post('/nickname').send(data).expect('Billy', done)
    })

    it('GET should return nickname if it exists', function(done) {
      const address = '20347f5b106c870649737930a01841d7ac9ed94c'
      request(server).get(`/nickname?addr=${address}`).expect(200).expect('Billy', done)
    })

    it('should delete entry when done', function() {
      User.findOne({ address: '20347f5b106c870649737930a01841d7ac9ed94c' }).remove().then( (data) => {
        assert.equals(data, true)
      })
    })

    // it('DELETE should remove a nickname', function(done) {
    //   const address = '20347f5b106c870649737930a01841d7ac9ed94c'
    //   request(server).delete(`/nickname?addr=${address}`).expect(200, done)
    // })
  })

  

  describe('GET /nonce', function() {
    it('should respond with the nonce for a given transaction', function(done) {

    })
  })
})

function generateSignature(hash, privateKeyBuffer) {
  let { r, s, v } = ethUtil.ecsign(
    ethUtil.hashPersonalMessage(hash),
    privateKeyBuffer
  )

  return bufferUtil.bufferToHex(
    Buffer.concat(
      [ r, s, Buffer.from([ v ]) ]
    )
  )
}
