const product=require("../models/postModels");
const cateModel=require("../models/cateModels");
const fs=require("fs");
const productAuth=require("../auth/productAuth");
const multer = require("multer");
const {session}=require('../config/autoLoad');
const {checkText}=require("../config/regex");


module.exports={
    index:async function (req,res){
        let userLogin=session(req).user;
        product.find(function (err,result){
            if(err){
                res.status(500).json(err);
            }else{
                cateModel.find(function(err,cate){
                    res.render("admin/product/index",{data:result,cate:cate,user:userLogin});
                })
               
            }
        })
    },
    getAdd:function(req,res){
        let userLogin=session(req).user;
        cateModel.find(function(err,result){
            if(err){
                res.status(500).json(err);
            }else{
                res.render("admin/product/add",{data:result,user:userLogin});
            }
        })
    }
    ,postAdd:function(req,res,next){
        let params=req.body;
        //checkText
        let name=checkText(params.name);
        let description=checkText(params.decript);
        let price=checkText(params.price);
        //validate
        if(name.length==0|| price.length==0 || description.length==0){
             productAuth.add(req);
             return res.redirect("/admin/product/add");
        }
        // add data
        var data={
            name:name,
            category:params.category,
            price:params.price,
            decription:description,
            
            creationDate:new Date(),
        }
        if(req.file){
            var img = fs.readFileSync("./public/uploads/" + req.file.filename);
            var encode_image = img.toString('base64');
            data.image={
                data:Buffer.from(encode_image, 'utf8')
            };
        }
        product.create(data,function (err,result){
            if(err){
                res.status(500).json(err);
            }else{
                productAuth.successAdd(req);
                res.redirect('/admin/product/');
            }
        })
        
    }, 
     getEdit:function (req,res,next){
         const id=req.params.id;
         let userLogin=session(req).user;
        product.findById({_id:req.params.id},function(err,result){
            if(err){
                res.status(500).json(err);
            }else{
                cateModel.find(function(err,cate){
                    res.render("admin/product/edit",{data:result,cate:cate,user:userLogin});
                })
            }
        })
    },
    // update
    postEdit :function(req,res,next){
        let params=req.body;
        let name=checkText(params.name);
        let description=checkText(params.decript);
        let price=checkText(params.price);
        if(name.length==0 || description.length==0 || price.length==0){
                productAuth.add(req);
                return res.redirect("/admin/product/edit/"+req.params.id);
        }
        var data={
            name:name,
            category:params.category,
            price:price,
            decription:description
        }
        if(req.file){ 
            var img = fs.readFileSync("./public/uploads/" + req.file.filename);
            var encode_image = img.toString('base64');
            data.image={
                data:Buffer.from(encode_image, 'utf8')
            };
        }
        product.updateOne({_id:req.params.id}, {$set:data},function(err,result){
            if(err){
                res.status(500).json(err);
            }else{
                res.redirect('/admin/product/');
            }
        })
    },
    //delete
    delete:function(req,res){
        product.deleteOne({_id:req.params.id},function(err,result){
            if(err){
                res.status(500).json(err);
            }else{
                res.redirect("/admin/product/");
            }
        })
    }
}