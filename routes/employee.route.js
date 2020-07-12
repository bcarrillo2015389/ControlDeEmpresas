'use strict'

var express = require('express');
var employeeController = require('../controllers/employee.controller');

var api = express.Router();

api.put('/setEmployee/:idEnt', employeeController.setEmployee);
api.put('/:idEnt/updateEmployee/:idEmp', employeeController.updateEmployee);
api.put('/:idEnt/removeEmployee/:idEmp', employeeController.removeEmployee);
api.get('/getEmployees/:idEnt', employeeController.getEmployees);
api.get('/listEmployeesCount/:id', employeeController.listEmployeesCount);

module.exports = api;