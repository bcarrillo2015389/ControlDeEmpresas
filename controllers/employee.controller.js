'use strict'

var Enterprise = require('../models/enterprise.model');
var Employee = require('../models/employee.model');

function setEmployee (req, res){
    var idEnt = req.params.idEnt;
    var params = req.body;
    var employee = new Employee();

    if(params.dpi && params.name && params.department && params.position &&
        params.phone && params.email){
            Enterprise.findOne({$or:[
                {'employees.dpi':params.dpi},
                {'employees.phone':params.phone},
                {'employees.email':params.email}
            ]}, (err, employeeFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(employeeFind){
                    res.send({message:'DPI, telefono o email ya utilizados.'});
                }else{
                    employee.dpi = params.dpi;
                    employee.name = params.name;
                    employee.department = params.department;
                    employee.position = params.position;
                    employee.phone = params.phone;
                    employee.email = params.email;

                    Enterprise.findByIdAndUpdate(idEnt, {$push:{employees:employee}},{new:true}, (err, enterpriseUpdated)=>{
                        if(err){
                            res.status(500).send({message:'Error general'});
                        }else if(enterpriseUpdated){
                            let num = enterpriseUpdated.employees.length - 1;
                            res.send({message:'Empleado agregado correctamente.',
                            enterprise:enterpriseUpdated.name,
                            employee:enterpriseUpdated.employees[num]});
                        }else{
                            res.status(404).send({message:'Empleado no agregado. Posible empresa inexistente.'});
                        }
                    });
                }
            });
    }else{
        res.send({message:'Ingresa todos los datos necesarios.'});
    }
}

function updateEmployee(req, res){
    let idEnt = req.params.idEnt;
    let idEmp = req.params.idEmp
    let update = req.body;
    let employeeSaved;

    Enterprise.findOne({'_id':idEnt, 'employees._id':idEmp}, (err, enterpriseFind)=>{
        if(err){
            res.status(500).send({message:'Error general'});
        }else if(enterpriseFind){
             employeeSaved = enterpriseFind.employees.find(element => element._id==idEmp);
             var num = enterpriseFind.employees.indexOf(employeeSaved);
             var findDpi;
             var findPhone;
             var findEmail;

             if(!update.dpi){
                findDpi = '';
             }else if(update.dpi){
                if(update.dpi == employeeSaved.dpi){
                    findDpi = '';
                }else{
                    findDpi = update.dpi;
                }
             }
             
             if(!update.phone){
                findPhone = '';
             }else if(update.phone){
                if(update.phone == employeeSaved.phone){
                    findPhone = '';
                }else{
                    findPhone = update.phone;
                }
             }

             if(!update.email){
                findEmail = '';
             }else if(update.email){
                if(update.email == employeeSaved.email){
                    findEmail = '';
                }else{
                    findEmail = update.email;
                }
             }

             Enterprise.findOne({$or:[ {'employees.dpi':findDpi},{'employees.phone':findPhone},{'employees.email':findEmail},]},(err, employeeFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(employeeFind){
                    res.send({message:'DPI, telefono o email ya utilizados.'});
                }else{
                    Enterprise.findOneAndUpdate({'_id':idEnt, 'employees._id':idEmp},
                    {'employees.$.dpi':update.dpi || employeeSaved.dpi,
                    'employees.$.name':update.name || employeeSaved.name,
                    'employees.$.department':update.department || employeeSaved.department,
                    'employees.$.position': update.position || employeeSaved.position,
                    'employees.$.phone':update.phone || employeeSaved.phone,
                    'employees.$.email':update.email || employeeSaved.email},{new:true}, (err, enterpriseUpdated)=>{
                        if(err){
                            res.status(500).send({message:'Error general'});
                        }else if(enterpriseUpdated){
        
                            res.send({message:'Empleado actualizado.',
                            enterprise:enterpriseUpdated.name,
                            employee: enterpriseUpdated.employees[num]});
                        }else{
                            res.status(418).send({message:'Empleado no actualizado.'});
                        }
                    });
                }
            });
        }else{
            res.status(404).send({message:'Empresa inexistente o empleado no encontrado.'});
        }
    });
}

function removeEmployee(req, res){
    let idEnt = req.params.idEnt;
    let idEmp = req.params.idEmp;

    Enterprise.findOneAndUpdate({_id:idEnt, 'employees._id':idEmp}, {$pull:{employees:{_id:idEmp}}}, {new:true},
        (err,enterpriseUpdated)=>{
            if(err){
                res.status(500).send({message:'Error general'});
            }else if(enterpriseUpdated){
                res.send({message:'Empleado eliminado.', enterprise:enterpriseUpdated});
            }else{
                res.status(418).send({message:'Empleado no eliminado'});
            }
    });
}

function searchEmployee(req, res){
    var idEnt = req.params.idEnt
    var search = req.body.search;
    var result = [];

    if(req.body.search){
        Enterprise.find({_id:idEnt, id:{$regex:search, $options:'i'}});
    }else{
        res.send({message:'Ingresa el campo de busqueda.'});
    }
}

function listEmployeesCount(req, res){
    let id = req.params.id;

    Enterprise.findById(id, (err, enterpriseFind)=>{
        if(err){
            res.status(500).send({message:'Error general'})
        }else if(enterpriseFind){
            res.send({enterprise:enterpriseFind.name, 'cantidad: ':enterpriseFind.employees.length + ' empleado(s) registrado(s).'});
        }else{
            res.status(404).send({message:'Empresa inexistente.'});
        }
    });
}

function getEmployees(req, res){
    var idEnt = req.params.idEnt;

    Enterprise.findById(idEnt, (err, enterpriseFind)=>{
        if(err){
            res.status(500).send({message:'Error general'}); 
        }else if(enterpriseFind){
            if(enterpriseFind.employees.length>0){
                res.send({enterprise:enterpriseFind.name, employees: enterpriseFind.employees});
            }else{
                res.send({message:'No hay datos que mostrar.'});
            }
        }else{
            res.status(404).send({message:'Empresa inexistente'});  
        }
    });
}


module.exports = {
    setEmployee,
    updateEmployee,
    removeEmployee,
    searchEmployee,
    getEmployees,
    listEmployeesCount
}