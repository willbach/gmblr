const nonceService = {}

nonceService.getNonce = (address1, address2) => {
    //make a call to the mainnet to get the nonce
    const noncePromise = new Promise()
    noncePromise.resolve(1)
}

module.exports = nonceService
