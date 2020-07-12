'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = '1e09876jkstsllm';

exports.createToken = (enterprise)=>{
    var payload = {
        sub:enterprise._id,
        name:enterprise.name,
        user: enterprise.user,
        iat: moment().unix(),
        exp: moment().add(30, "minutes").unix()
    }

    return jwt.encode(payload, key);
}