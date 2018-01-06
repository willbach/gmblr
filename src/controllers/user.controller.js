const userService = require('../services/user.service')

const userController = {}

userController.getNickname = (req, res) => {
    userService.getNickname(req.query.addr).then( (user) => {
        if(!user || !user.nickname) {
            res.status(404).end('INVALID_ADDRESS')
        } else {
            res.status(200).end(user.nickname)
        }
    })
}

userController.storeNickname = (req, res) => {
    userService.storeNickname(req.body).then( (user) => {
        res.end(user.nickname)
    })
    .catch( (err) => {
        console.log('ERROR', err)
        res.status(400).end('NICKNAME_MUST_BE_UNIQUE')
    })
}

userController.deleteNickname = (req, res) => {
    userService.deleteNickname(req.query.addr).then( (data) => {
        res.status(200).end()
    })
    .catch( (err) => {
        console.log(err)
        res.status(400).end('DELETE_FAILED')
    })
}

module.exports = userController
