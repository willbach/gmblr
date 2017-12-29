const assert = require('assert')
const request = require('supertest')
const server = require('../src/server.js')

describe('GET /helloworld', function() {
  it('should respond with "hello world"', function(done) {
    request(server).get('/helloworld').expect('hello world', done)
  })
})

const ethUtil = require('ethereumjs-util')
const creditProtocolUtil = require('../src/utils/credit.protocol.util')
describe('Credit Protocol Util', function() {
  describe('#verifySignature', function() {
    it('should see if signature matches one of the addresses in a transaction', function() {
      const transaction = {
        creditorAddress: '20347f5b106c870649737930a01841d7ac9ed94c',
        debtorAddress: '20347f5b106c870649737930a01841d7ac9ed94d',
        ucacAddress: '20347f5b106c870649737930a01841d7ac9ed94e',
        amount: 200,
        memo: 'Giants win by 3',
        nonce: 0
      }

      transaction.buffer = Buffer.concat([
        hexToBuffer(transaction.ucacAddress),
        hexToBuffer(transaction.creditorAddress),
        hexToBuffer(transaction.debtorAddress),
        int32ToBuffer(transaction.amount),
        int32ToBuffer(transaction.nonce)
      ])
      
      transaction.hash = ethUtil.sha3(transaction.buffer)
  
      const privateKeyBuffer = hexToBuffer('540a5e193cebd774a1af02723ba5798d7ff2dec454a56bcd07aa5cf0e6d94ce7')
  
      //generate signature
      const { r, s, v } = ethUtil.ecsign(
        ethUtil.hashPersonalMessage(transaction.hash),
        privateKeyBuffer
      )
  
      const signature = bufferToHex(
        Buffer.concat(
          [ r, s, Buffer.from([ v ]) ]
        )
      )
      //GET to `localhost/nonce/${address1}/${address2}`
  
      let result = creditProtocolUtil.verifySignature(signature, transaction)
      assert.equal(result, true)
    })
  })
})

function hexToBuffer(value) {
  if (value.substr(0, 2) === '0x') {
      value = value.substr(2);
  }
  return Buffer.from(value, 'hex');
}
function stringToBuffer(value) {
  return Buffer.from(value);
}
function bufferToHex(buffer) {
  return buffer.toString('hex');
}
function int32ToBuffer(value) {
  const hexValue = value.toString(16);
  const z = '00000000', x = `${z}${z}`;
  const stringValue = `${x}${x}${x}${x}`.replace(new RegExp(`.{${hexValue.length}}$`), hexValue);
  return Buffer.from(stringValue, 'hex');
}
