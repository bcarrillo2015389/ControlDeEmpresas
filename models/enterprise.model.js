'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var enterpriseSchema = Schema({
    name:String,
    ceo:String,
    businessName:String,
    location:String,
    employees:[{
        dpi:String,
        name:String,
        department:String,
        position:String,
        phone:String,
        email:String
    }],
    subsidiaries:[{
        name:String,
        ceo:String,
        location:String,
        stock:[{
            productName:String,
            quantity:Number
        }]
    }],
    stock:[{
        productName:String,
        quantity:Number
    }],
    user:String,
    password:String
});

module.exports = mongoose.model('enterprise', enterpriseSchema);