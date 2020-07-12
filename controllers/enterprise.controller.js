'use strict'

var Enterprise = require('../models/enterprise.model');
var bcrypt  = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function login(req, res){
    var params = req.body;

    if(params.user && params.password){
        Enterprise.findOne({user:params.user},(err, enterpriseFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseFind){
                bcrypt.compare(params.password, enterpriseFind.password, (err, passwordOk)=>{
                    if(err){
                        res.status(500).send({message:'Error al comparar'});
                    }else if(passwordOk){
                        if(params.getToken){
                            res.send({token:jwt.createToken(enterpriseFind)});
                        }else{
                            res.send({message:'Bienvenido', user:enterpriseFind.name});
                        }
                    }else{
                        res.send({message:'Usuario o contraseña incorrecto.'});
                    }
                });
            }else{
                res.send({message:'Usuario o contraseña incorrecto.'});
            }
        });
    }else{
        res.send({message:'Ingrese los campos necesarios.'});
    }
}

function saveEnterprise(req, res){
    var enterprise = new Enterprise();
    var params = req.body;

    if(params.name && params.ceo && params.businessName && params.location && params.user && params.password){
        Enterprise.findOne({$or:[
            {user:params.user},
            {name:params.name},
            {location:params.location}
        ]}, (err, enterpriseFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(enterpriseFind){
                res.send({message:'Nombre, usuario o locacion ya utilizados.'});
            }else{
                enterprise.name = params.name;
                enterprise.ceo = params.ceo;
                enterprise.businessName = params.businessName;
                enterprise.location = params.location;
                enterprise.user = params.user;
                
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message:'Error al encriptar contraseña.'});
                    }else if(passwordHash){
                        enterprise.password = passwordHash;
                    }else{
                        res.status(418).send({message:'Error inesperado.'});
                    }
                });

                enterprise.save((err, enterpriseSaved)=>{
                    if(err){
                        res.status(500).send({message:'Erro general al guardar empresa.'});
                    }else if(enterpriseSaved){
                        res.send({message:'Empresa creada.', enterprise: enterpriseSaved});
                    }else{
                        res.status(404).send({message:'Empresa no guardada.'});
                    }
                });
            }
        });
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }

}

function updateEnterprise(req, res){
    let id = req.params.id;
    var update = req.body;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(update.employees || update.subsidiaries || update.stock || update.user){
            res.send('No es posible actualizar lo solicitado.');
        }else{
            Enterprise.findOne({'_id':id}, (err, enterpriseFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(enterpriseFind){
                     var findName;
                     var findLocation;
        
                     if(!update.name){
                        findName = '';
                     }else if(update.name){
                        if(update.name == enterpriseFind.name){
                            findName = '';
                        }else{
                            findName = update.name;
                        }
                     }
        
                     if(!update.location){
                        findLocation = '';
                     }else if(update.location){
                        if(update.location == enterpriseFind.location){
                            findLocation = '';
                        }else{
                            findLocation = update.location;
                        }
                     }
        
                     Enterprise.findOne({$or:[ {'name':findName},{'location':findLocation}]},(err, enterpriseOk)=>{
                        if(err){
                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                        }else if(enterpriseOk){
                            res.send({message:'Nombre o locacion ya utilizados.'});
                        }else{
                            Enterprise.findByIdAndUpdate(id, update, {new:true}, (err, entUpdated)=>{
                                if(err){
                                    res.status(500).send({message:'Error general'});
                                }else if(entUpdated){
                                    res.send({message:'Empresa actualizada', enterprise: entUpdated});
                                }else{
                                    res.status(404).send({message: 'No se actualizo.'});
                                }
                            });
                        }
                    });
                }else{
                    res.status(404).send({message:'Empresa inexistente.'});
                }
            });
        }

    }
}

function deleteEnterprise(req, res){
    let id = req.params.id;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findByIdAndRemove(id, (err, entRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error general'});
            }else if(entRemoved){
                res.send({message:'Empresa eliminada.', enterprise:entRemoved});
            }else{
                res.status(404).send({message: 'No se elimino de la BD.'});  
            }
        });
    }
}

function getEnterprises(req, res){
	Enterprise.find({}, (err, enterpriseFind)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(enterpriseFind){
            res.send({enterprise:enterpriseFind});
        }else{
            res.status(404).send({message: 'No se encontraron empresas.'});
        }
	});
}

module.exports = {
    saveEnterprise,
    updateEnterprise,
    deleteEnterprise,
    getEnterprises,
    login
}