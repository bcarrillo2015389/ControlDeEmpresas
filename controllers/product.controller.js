'use strict'

var Enterprise = require('../models/enterprise.model');
var Subsidiary = require('../models/subsidiary.model');
var Product = require('../models/product.model');
var pdf = require('pdfkit');
var fs = require('fs');

function importProduct(req, res){
    var idEnt = req.params.idEnt;
    var params = req.body;
    var product = new Product();

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(params.productName && params.quantity){
            Enterprise.findOne({'stock.productName': params.productName}, (err, enterpriseFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(enterpriseFind){
                    res.send({message:'Nombre de producto ya utilizado.'});
                }else{
                    product.productName = params.productName;
                    product.quantity = params.quantity;
    
                    Enterprise.findByIdAndUpdate(idEnt, {$push:{stock:product}}, 
                        {new:true}, (err, entUpdated)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(entUpdated){
                                let num = entUpdated.stock.length-1;
                                res.send({message:'Producto agregada correctamente.',
                                    enterprise: entUpdated.name,
                                stock: entUpdated.stock[num]});
                            }else{
                                res.status(404).send({message:'Producto no agregado. Posible empresa inexistente.'});
                            }
                    });
                }
            });
        }else{
            res.send({message:'Ingresa todos los datos necesarios.'});
        }
    }
}

function setProduct(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;
    var idProduct = req.params.idProduct;

    var params = req.body;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(params.quantity){
            Enterprise.findOne({$and:[{'_id':idEnt, 'subsidiaries._id':idSub,'subsidiaries.stock._id':idProduct}]},(err, entFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(entFind){
                    var productSaved = entFind.stock.find(element => element._id==idProduct);

                    if(productSaved.quantity>=params.quantity){
                        var subSaved = entFind.subsidiaries.find(element => element._id==idSub);
                        var productSaved2 = subSaved.stock.find(element => element._id==idProduct);

                        if(productSaved2){
                            var num = parseInt(productSaved2.quantity)+parseInt(params.quantity);

                            Enterprise.findOneAndUpdate({'_id':idEnt, 'subsidiaries._id':idSub, 'subsidiaries.stock._id':idProduct},
                            {'subsidiaries.$[a].stock.$[b].quantity':num},{arrayFilters:[{'a._id':idSub},{'b._id':idProduct}],new:true},(err, entUpdated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general', err});
                                }else if(entUpdated){

                                    Enterprise.findOne({'_id': idEnt, 'subsidiaries._id':idSub}, (err, enterpriseFind)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                        }else if(enterpriseFind){
        
                                            var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
                                            var num = productSaved.quantity-params.quantity;
                                            
                                            Enterprise.findOneAndUpdate({'_id':idEnt, 'stock._id':idProduct},
                                                {'stock.$.quantity':num},{new:true},(err, entUpdated)=>{
                                                    if(err){
                                                        res.status(500).send({message:'Error general'});
                                                    }else if(entUpdated){
                                                        res.send({message:'Producto agregado.',
                                                        enterprise:entUpdated});
                                                    }else{
                                                        res.status(418).send({message:'Stock en empresa no actualizado.'});
                                                    }
                                            });
                                        }else{
                                            res.status(418).send({message:'Producto no agregado.'});
                                        }
                                    });
                                    
                                }else{
                                    res.status(418).send({message:'Producto no agregado.'});
                                }
                            });
                        }else{
                            Enterprise.findOne({'_id': idEnt, 'subsidiaries._id':idSub}, (err, enterpriseFind)=>{
                                if(err){
                                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                }else if(enterpriseFind){
                                    var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
                
                                    if(productSaved.quantity>=params.quantity){
                                        productSaved.quantity = params.quantity;
                
                                        Enterprise.findOneAndUpdate({'_id':idEnt, 'subsidiaries._id':idSub},
                                        {$push:{'subsidiaries.$.stock':productSaved}},{new:true},(err, entUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general'});
                                            }else if(entUpdated){
                    
                                                Enterprise.findOne({'_id': idEnt, 'subsidiaries._id':idSub}, (err, enterpriseFind)=>{
                                                    if(err){
                                                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                                    }else if(enterpriseFind){
                    
                                                        var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
                                                        var num = productSaved.quantity-params.quantity;
                                                        
                                                        Enterprise.findOneAndUpdate({'_id':idEnt, 'stock._id':idProduct},
                                                            {'stock.$.quantity':num},{new:true},(err, entUpdated)=>{
                                                                if(err){
                                                                    res.status(500).send({message:'Error general'});
                                                                }else if(entUpdated){
                                                                    res.send({message:'Producto agregado.',
                                                                    enterprise:entUpdated});
                                                                }else{
                                                                    res.status(418).send({message:'Stock en empresa no actualizado.'});
                                                                }
                                                        });
                                                    }else{
                                                        res.status(418).send({message:'Producto no agregado.'});
                                                    }
                                                 });
                                            }else{
                                                res.status(418).send({message:'Producto no agregado.'});
                                            }
                                        });
                                        }else{
                                            res.send({message:'Error. Cantidad mayor al stock de la empresa.'});
                                        }
                                }else{
                                    res.send({message:'Empresa o sucursal inexistente.'});
                                }
                            });
                        }
                    }else{
                        res.send({message:'Error. Cantidad mayor al stock de la empresa.'});
                    }
                    
                }else{
                    Enterprise.findOne({'_id': idEnt, 'subsidiaries._id':idSub}, (err, enterpriseFind)=>{
                        if(err){
                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                        }else if(enterpriseFind){
                            var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
        
                            if(productSaved.quantity>=params.quantity){
                                productSaved.quantity = params.quantity;
        
                                Enterprise.findOneAndUpdate({'_id':idEnt, 'subsidiaries._id':idSub},
                                {$push:{'subsidiaries.$.stock':productSaved}},{new:true},(err, entUpdated)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general'});
                                    }else if(entUpdated){
            
                                        Enterprise.findOne({'_id': idEnt, 'subsidiaries._id':idSub}, (err, enterpriseFind)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general, intentelo mas tarde.'});
                                            }else if(enterpriseFind){
            
                                                var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
                                                var num = productSaved.quantity-params.quantity;
                                                
                                                Enterprise.findOneAndUpdate({'_id':idEnt, 'stock._id':idProduct},
                                                    {'stock.$.quantity':num},{new:true},(err, entUpdated)=>{
                                                        if(err){
                                                            res.status(500).send({message:'Error general'});
                                                        }else if(entUpdated){
                                                            res.send({message:'Producto agregado.',
                                                            enterprise:entUpdated});
                                                        }else{
                                                            res.status(418).send({message:'Stock en empresa no actualizado.'});
                                                        }
                                                });
                                            }else{
                                                res.status(418).send({message:'Producto no agregado.'});
                                            }
                                         });
                                    }else{
                                        res.status(418).send({message:'Producto no agregado.'});
                                    }
                                });
                                }else{
                                    res.send({message:'Error. Cantidad mayor al stock de la empresa.'});
                                }
                        }else{
                            res.send({message:'Empresa o sucursal inexistente.'});
                        }
                    });
                }
            });
        }else{
            res.send({message:'Ingresa todos los datos.'});
        }
    }
}

function updateProduct(req, res){
    var idEnt = req.params.idEnt;
    var idProduct = req.params.idProduct;

    var update = req.body;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findOne({'_id':idEnt, 'stock._id':idProduct}, (err, enterpriseFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseFind){
                var productSaved = enterpriseFind.stock.find(element => element._id==idProduct);
                 var findName;
    
                 if(!update.productName){
                    findName = '';
                 }else if(update.productName){
                    if(update.productName == productSaved.productName){
                        findName = '';
                    }else{
                        findName = update.productName;
                    }
                 }

                 Enterprise.findOne({'_id':idEnt, 'stock.productName':findName},
                 (err, enterpriseFind)=>{
                    if(err){
                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                    }else if(enterpriseFind){
                        res.send({message:'Nombre de producto ya utilizado.'});
                    }else{
                        var num;

                        if(update.quantity){
                            num = parseInt(update.quantity)+parseInt(productSaved.quantity);
                        }else{
                            num = productSaved.quantity;
                        }

                        Enterprise.findOneAndUpdate({'_id':idEnt, 'stock._id':idProduct},
                        {'stock.$.productName':update.productName || productSaved.productName,
                        'stock.$.quantity':num},{new:true}, (err, enterpriseUpdated)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(enterpriseUpdated){
            
                                Enterprise.findOneAndUpdate({'_id':idEnt, 'subsidiaries.stock._id':idProduct},
                                    {'subsidiaries.$[].stock.$[b].productName':update.productName || productSaved.productName},{arrayFilters:[{'b._id':idProduct}],new:true},(err, entUpdated)=>{
                                        if(err){
                                            res.status(500).send({message:'Error general', err});
                                        }else if(entUpdated){
                                            res.send({message:'Producto actualizado.',
                                                    enterprise:entUpdated});

                                        }else{
                                            res.send({message:'No actualizado.'});
                                        }
                                    });
                            }else{
                                res.status(418).send({message:'Empleado no actualizado.'});
                            }
                        });
                    }
                });
            }else{
                res.status(404).send({message:'No se encontraron coincidencias con los datos.'});
            }
        });
            
    }
}

function removeProduct(req, res){
    var idEnt = req.params.idEnt;
    var idProduct = req.params.idProduct;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findOneAndUpdate({_id:idEnt, 'stock._id':idProduct}, {$pull:{stock:{_id:idProduct}}}, {new:true},
        (err,enterpriseUpdated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseUpdated){
                res.send({message:'eliminado.'});

                Enterprise.findOneAndUpdate({'_id':idEnt, 'subsidiaries.stock._id':idProduct},
                    {$pull:{'subsidiaries.$[].stock':{'_id':idProduct}}},{new:true},(err, entUpdated)=>{
                        if(err){
                            res.status(500).send({message:'Error general', err});
                        }
                    });
            }else{
                res.status(418).send({message:'Producto no eliminado'});
            }
    });
    }

}

function listSubsidiaryProducts(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findById(idEnt, (err,entFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(entFind){
                var subsidiary = entFind.subsidiaries.find(element=>element.id==idSub);
                res.send({message:'Productos en stock.',
                        enterprise:entFind.name,
                        subsidiary:subsidiary.name,
                        stock:subsidiary.stock});
            }else{
                res.status(418).send({message:'No se encontraron datos.'});
            }
    });
    }
}

function listEnterpriseProducts(req, res){
    var idEnt = req.params.idEnt;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findById(idEnt, (err,entFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(entFind){
                res.send({message:'Productos en stock.',
                        enterprise:entFind.name,
                        stock:entFind.stock});
            }else{
                res.status(418).send({message:'No se encontraron datos.'});
            }
    });
    }

}

function listProductsCount(req, res){
    var idEnt = req.params.idEnt;
    var idProduct = req.params.idProduct;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findById(idEnt,(err, entFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(entFind){
                var product = entFind.stock.find(element=>element.id==idProduct);

                var sum=0;
                entFind.subsidiaries.forEach(element => {
                    element.stock.forEach(element =>{
                        if(element._id==idProduct){
                            sum =sum+parseInt(element.quantity);
                        }
                    });
                });

                entFind.stock.forEach(element => {
                        if(element._id==idProduct){
                            sum =sum+parseInt(element.quantity);
                        }
                });

                res.send({message:'Cantidad de productos en stock.',
                        enterprise:entFind.name,
                        product:product.productName,
                        stock:sum});
            }else{
                res.status(418).send({message:'No se encontraron datos.'});
            }
    });
    }

}

function listSubsidiaryCount(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;
    var idProduct = req.params.idProduct;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findOne({'_id':idEnt, 'subsidiaries._id':idSub},(err, entFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(entFind){
                var subsidiary = entFind.subsidiaries.find(element=>element.id==idSub);
                var product = subsidiary.stock.find(element=>element.id==idProduct);

                res.send({message:'Cantidad de productos en stock.',
                        enterprise:entFind.name,
                        subsidiary:subsidiary.name,
                        product:product.productName,
                        stock:product.quantity});
            }else{
                res.status(418).send({message:'No se encontraron datos.'});
            }
    });
    }

}

function searchProduct(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;
    var params = req.body;
    var products = [];
    var result = [];

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
            switch (params.kind){
                case 'enterprise':
                    if(Number.isInteger(parseInt(params.search))){
                            Enterprise.findById(idEnt, (err,entFind)=>{
                                if(err){
                                    res.status(500).send({message : 'Error general en el servidor'});
                                } else if (entFind){
                                    products = entFind.stock;
                                    for (var i in products){
                                        var product = products[i]; 
                                        if(product.quantity == params.search){
                                            result.push(product);
                                        }
                                        i++;
                                    }
                                    if(result.length > 0){
                                        res.send({'products': result});
                                    } else {
                                        res.send({message: 'No existen coincidencias.'});
                                    }
                                } else {
                                    res.status(404).send({ message : 'No se encontaron registros.'});
                                }
                            });
                         } else {
                                Enterprise.findById(idEnt, (err,entFind)=>{
                                    if(err){
                                        res.status(500).send({message : 'Error general en el servidor'});
                                    } else if (entFind){
                                        products = entFind.stock;
                                        for (var i in products){
                                            var product = products[i]; 
                                            if(product.productName == params.search){
                                                result.push(product);
                                            }
                                            i++;
                                        }
                                        if(result.length > 0){
                                            res.send({'products': result});
                                        } else {
                                            res.send({message: 'No hay productos con el parametro ingresado'});
                                        }
                                    } else {
                                        res.status(404).send({ message : 'No se encontaron registros.'});
                                    }
                                });
                            }
                    break;

                case 'subsidiary':
                    if(Number.isInteger(parseInt(params.search))){
                        Enterprise.findById(idEnt, (err,entFind)=>{
                            if(err){
                                res.status(500).send({message : 'Error general en el servidor'});
                            } else if (entFind){
                                let subsidiary = entFind.subsidiaries.find(element => element._id == idSub);
                                products = subsidiary.stock;
    
                                for(var j in products){
                                    var product = products[j];
                                    if(product.quantity == params.search){
                                        result.push(product);
                                    }
                                    j++;
                                }
    
                                if(result.length > 0){
                                    res.send({'products': result});
                                } else {
                                    res.send({message: 'No hay productos con la cantidad ingresada'});
                                }
                            } else {
                                res.status(404).send({ message : 'No se han encontrado registros a mostrar'});
                            }
                        });
                     } else {
                            Enterprise.findById(idEnt, (err,entFind)=>{
                                if(err){
                                    res.status(500).send({message : 'Error general en el servidor'});
                                } else if (entFind){
                                    var subsidiary = entFind.subsidiaries.find(element => element._id == idSub);
                                    products = subsidiary.stock;
        
                                    for (var i in products){
                                        var product = products[i]; 
                                        if(product.productName == params.search){
                                            result.push(product);
                                        }
                                        i++;
                                    }
                                    if(result.length > 0){
                                        res.send({'products': result});
                                    } else {
                                        res.send({message: 'No hay productos con el parametro ingresado.'});
                                    }
                                } else {
                                    res.status(404).send({ message : 'No se han encontrado registros a mostrar.'});
                                }
                            });
                        }
                break;
    
                default:
                    res.status(404).send({ message : 'Debe de ingresar una opción válida.'});
                break;
            }
    }
}

function createPDF(req,res){
    let idEnt = req.params.idEnt;
    let idSub = req.params.idSub;

        if(idEnt != req.user.sub){
            res.send({ message : 'Error de permisos para esta ruta'});
        } else {
            Enterprise.findById(idEnt,(err,entFind)=>{
                if (err){
                    res.status(500).send({ message : 'Error general en el servidor'});
                } else if (entFind){
                    let subsidiary = entFind.subsidiaries.find(element => element._id == idSub);
                    let products = subsidiary.stock;

                    var doc = new pdf();

                    doc.pipe(fs.createWriteStream('./Example.pdf'));

                    doc.fontSize(25).text(subsidiary.name, {
                        align: 'center',
                    });

                    for(var pro in products){
                    var product = products[pro];

                    var productName = product.productName;
                    var quantity = product.quantity;
                
                    doc.fontSize(10).text('Name Procuct: ' + productName, {
                        columns: 1
                    });
        
                    doc.fontSize(10).text('Quantity: ' + quantity, {
                        columns: 1
                    });
                    }    
                    
                    doc.end();

                    res.send({message: 'PDF exitoso'});
                } else {
                    res.status(404).send({ message:  'No se han encontrado registros a mostrar'});
                }
            })
    }
}

module.exports = {
    importProduct,
    setProduct,
    updateProduct,
    removeProduct,
    listSubsidiaryProducts,
    listEnterpriseProducts,
    listProductsCount,
    listSubsidiaryCount,
    searchProduct,
    createPDF
}