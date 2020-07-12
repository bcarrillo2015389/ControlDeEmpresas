'use strict'

var express = require('express');
var enterpriseController = require('../controllers/enterprise.controller');

var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

api.post('/login', enterpriseController.login);
api.post('/saveEnterprise', enterpriseController.saveEnterprise);
api.get('/getEnterprises', enterpriseController.getEnterprises);

//Propias de la empresa.
api.put('/updateEnterprise/:id', mdAuth.ensureAuth, enterpriseController.updateEnterprise);
api.delete('/deleteEnterprise/:id', mdAuth.ensureAuth, enterpriseController.deleteEnterprise);

module.exports = api;