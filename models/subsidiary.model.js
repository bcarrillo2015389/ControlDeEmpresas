'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subsidiarySchema = Schema({
    name:String,
    ceo:String,
    location:String,
    stock:[{
        productName:String,
        quantity:Number
    }]
});

module.exports = mongoose.model('subsidiarie', subsidiarySchema);