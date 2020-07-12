'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');

var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

api.put('/importProduct/:idEnt', mdAuth.ensureAuth, productController.importProduct );
api.put('/:idEnt/setProduct/:idSub/:idProduct', mdAuth.ensureAuth, productController.setProduct);
api.put('/:idEnt/updateProduct/:idProduct', mdAuth.ensureAuth, productController.updateProduct);
api.put('/:idEnt/removeProduct/:idProduct', mdAuth.ensureAuth, productController.removeProduct);
api.get('/:idEnt/listSubsidiaryProducts/:idSub', mdAuth.ensureAuth, productController.listSubsidiaryProducts);
api.get('/listEnterpriseProducts/:idEnt', mdAuth.ensureAuth, productController.listEnterpriseProducts);
api.get('/:idEnt/listProductsCount/:idProduct', mdAuth.ensureAuth, productController.listProductsCount);
api.get('/:idEnt/listSubsidiaryCount/:idSub/:idProduct', mdAuth.ensureAuth, productController.listSubsidiaryCount);
api.get('/:idEnt/searchProduct/:idSub', mdAuth.ensureAuth, productController.searchProduct);
api.get('/:idEnt/createPDF/:idSub', mdAuth.ensureAuth, productController.createPDF);

module.exports = api;