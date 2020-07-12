'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employeeSchema = Schema({
    dpi:String,
    name:String,
    department:String,
    position:String,
    phone:String,
    email:String
});

module.exports = mongoose.model('employee', employeeSchema);