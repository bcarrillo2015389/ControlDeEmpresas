'use strict'

var express = require('express');
var subsidiaryController = require('../controllers/subsidiary.controller');

var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

api.put('/setSubsidiary/:idEnt', mdAuth.ensureAuth ,subsidiaryController.setSubsidiary);
api.put('/updateSubsidiary/:idEnt/:idSub', mdAuth.ensureAuth, subsidiaryController.updateSubsidiary);
api.delete('/removeSubsidiary/:idEnt/:idSub', mdAuth.ensureAuth, subsidiaryController.removeSubsidiary);
api.get('/getSubsidiaries/:idEnt', mdAuth.ensureAuth, subsidiaryController.getSubsidiaries);

module.exports = api;