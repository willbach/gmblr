const nonceService = require('../services/nonce.service')

const nonceController = {}

nonceController.getNonce = (req, res) => {
    nonceService.getNonce(req.params.address1, req.params.address2)
    .then( (nonce) => {
        res.end(nonce)
    })
    .catch( (err) => {
        res.status(404).end("Nonce Not Found")
    })
}

module.exports = nonceController
