'use strict'

var Enterprise = require('../models/enterprise.model');
var Subsidiary = require('../models/subsidiary.model');

function setSubsidiary(req, res){
    var idEnt = req.params.idEnt;
    var params = req.body;
    var subsidiary = new Subsidiary();

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(params.name && params.ceo && params.location){
            Enterprise.findOne({$or:[{'subsidiaries.name':params.name},
            {'subsidiaries.location':params.location}]}, (err, enterpriseFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(enterpriseFind){name
                    res.send({message:'Nombre de sucursal o locacion ya utilizadas.'});
                }else{
                    subsidiary.name = params.name;
                    subsidiary.ceo = params.ceo;
                    subsidiary.location = params.location;
    
                    Enterprise.findByIdAndUpdate(idEnt, {$push:{subsidiaries:subsidiary}}, 
                        {new:true}, (err, entUpdated)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(entUpdated){
                                let num = entUpdated.subsidiaries.length-1;
                                res.send({message:'Sucursal agregada correctamente.',
                                    enterprise: entUpdated.name,
                                subsidiary: entUpdated.subsidiaries[num]});
                            }else{
                                res.status(404).send({message:'Sucursal no agregada. Posible empresa inexistente.'});
                            }
                    });
                }
            });
        }else{
            res.send({message:'Ingresa todos los datos necesarios.'});
        }
    }
}

function updateSubsidiary(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;
    var update = req.body;
    var subsidiarySaved;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findOne({_id:idEnt, 'subsidiaries._id':idSub},(err, enterpriseFind)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseFind){
                subsidiarySaved = enterpriseFind.subsidiaries.find(element=>element._id==idSub);
                var num = enterpriseFind.subsidiaries.indexOf(subsidiarySaved);
                var findName;
                var findLocation;

                if(!update.name){
                    findName = '';
                 }else if(update.name){
                    if(update.name == subsidiarySaved.name){
                        findName = '';
                    }else{
                        findName = update.name;
                    }
                 }
                 
                 if(!update.location){
                    findLocation = '';
                 }else if(update.location){
                    if(update.location == subsidiarySaved.location){
                        findLocation = '';
                    }else{
                        findLocation = update.location;
                    }
                 }

                 Enterprise.findOne({$or:[{'subsidiaries.name':findName},{'subsidiaries.location':findLocation}]}, (err, subFind)=>{
                     if(err){
                        res.status(500).send({message:'Error general, intentelo mas tarde.'});
                     }else if(subFind){
                        res.send({message:'Nombre o locacion ya utilizados.'});
                     }else{
                        Enterprise.findOneAndUpdate({_id:idEnt, 'subsidiaries._id':idSub},
                        {'subsidiaries.$.name':update.name || subsidiarySaved.name,
                        'subsidiaries.$.location':update.location || subsidiarySaved.location,
                        'subsidiaries.$.ceo':update.ceo || subsidiarySaved.ceo},{new:true},(err, enterpriseUpdated)=>{
                            if(err){
                                res.status(500).send({message:'Error general'});
                            }else if(enterpriseUpdated){
                                res.send({message:'Sucursal actualizada.',
                                enterprise:enterpriseUpdated.name,
                                subsidiary: enterpriseUpdated.subsidiaries[num]});
                            }else{
                                res.status(418).send({message:'Sucursal no actualizada.'});
                            }
                        });
                     }
                 });

            }else{
                res.status(404).send({message:'Empresa inexistente o sucursal no encontrada.'});
            }
        });
    
    }
}

function removeSubsidiary(req, res){
    var idEnt = req.params.idEnt;
    var idSub = req.params.idSub;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findOneAndUpdate({_id:idEnt, 'subsidiaries._id':idSub},{$pull:{subsidiaries:{_id:idSub}}},
        {new:true},(err, enterpriseUpdated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseUpdated){
                res.send({message:'Sucursal eliminada.', enterprise:enterpriseUpdated});
            }else{
                res.status(418).send({message:'Sucursal no eliminada. Posible inexistencia.'});
            }
        });
    }
}

function getSubsidiaries(req, res){
    var idEnt = req.params.idEnt;

    if(idEnt != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Enterprise.findById(idEnt, (err, enterpriseFind)=>{
            if(err){
                res.status(500).send({message:'Error general'}); 
            }else if(enterpriseFind){
                if(enterpriseFind.subsidiaries.length>0){
                    res.send({enterprise:enterpriseFind.name, subsidiaries: enterpriseFind.subsidiaries});
                }else{
                    res.send({message:'No hay datos que mostrar.'});
                }
            }else{
                res.status(404).send({message:'Empresa inexistente'});  
            }
        });
    }
}

module.exports = {
    setSubsidiary,
    updateSubsidiary,
    removeSubsidiary,
    getSubsidiaries
}