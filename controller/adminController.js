// const postModel=require("../models/postModels");
const userModel=require('../models/userModels');
const adminAuth=require('../auth/adminAuth');
const bcrypt=require('bcrypt');
const session=require('express-session');
const {checkText}=require('../config/regex');
const profileAuth=require('../auth/profileAuth');


module.exports={
    index: (req,res,next) => {
        let user=req.session.user;
        res.render("admin/index",{user:user});
        next();
    },
    login:(req,res,next)=>{
        res.render("admin/login");
    },
    postLogin:(req,res,next)=>{
        let params=req.body;
        if(!params.email || !params.password){
            adminAuth.login(req);
            return res.redirect("/admin/login");
        }
        var email=params.email;
        var password=params.password;
        userModel.find({email:email},function(err,result){
            if(err){
                return res.status(500).json(err);
            }
            if(result.length==0){
                req.flash("error","Tài khoản không tồn tại");
                return res.redirect("/admin/login");
            }
            if(result[0].isAdmin!=0 && result[0].isAdmin!=1){
                req.flash("error","Bạn không đủ quyền đăng nhập");
                return res.redirect("/admin/login");
            }
            if(bcrypt.compareSync(password,result[0].password) ){
                req.flash('success',"Đăng nhập thành công");
                req.session.user=result[0];
                res.redirect("/admin/");
            }else{
                req.flash("error","Mật khẩu không chính xác");
                res.redirect("/admin/login");
            }
            
        })
    },logout:(req,res)=>{
        req.session.destroy();
        res.redirect("/admin/login");
    }
    ,
    resgiter:(req,res,next)=>{
        res.render("admin/resgiter");
    },
    postResgiter:(req,res,next)=>{
        let params=req.body;
        if(!params.name||!params.email || !params.address || !params.phone || !params.password){
            adminAuth.register(req);
            return res.redirect("/admin/resgiter");
        }
        if(params.password!=params.repassword){
            req.flash("error","Mật khẩu không khớp");
            return res.redirect("/admin/resgiter");
        }
        
        var data={
            name:params.name,
            email:params.email,
            phone:params.phone,
            address:params.address,
            isAdmin:0,
            password:params.password
        }
        userModel.find({email:params.email},function(err,result){
            if(result.length>0){
                req.flash("error","Tài khoản đã tồn tại,bạn có thể đến với đăng nhập");
                res.redirect("/admin/resgiter");
            }else if(result.length==0){
                userModel.create(data,function(err1,resultCre){
                    if(err){
                        res.status(500).json(err1);
                    }else{
                        req.flash('seccess',"Đăng kí thành công");
                        res.redirect("/admin/login");
                    }
                })
            }
        });    
    },
    profile:(req,res)=>{
        let user=req.session.user;
        res.render("admin/index/profile",{user:user});
    },
    setting:(req,res)=>{
        let user=req.session.user;
        res.render('admin/index/setting',{user:user})
    },
    postSetting:(req,res)=>{
        let params=req.body;
        let email=checkText(params.email);
        let name=checkText(params.name);
        let address=checkText(params.address);
        let phone=checkText(params.phone);
        if(email.length==0 || name.length==0 || address.length==0 || phone.length==0){
            profileAuth.changeInfo(req);
            return res.redirect('/admin/setting');
        }
        let data={
            email:email,
            name:name,
            address:address,
            phone:phone
        }
    
        userModel.updateOne({_id:req.session.user._id},{$set:data},function(error,data){
            if(error){
                return res.status(500).json(err);
            }
            req.flash('success','Thay đổi thông tin thành công');
            return res.redirect('/admin/')
        })
    },
    changePass:(req,res)=>{
        let user=req.session.user;
        return res.render("admin/index/changePassword",{user:user});
    },
    postChangePass:(req,res)=>{
        let params=req.body;
       
        let oldPassword=checkText(params.oldPass);
        let newPassword=checkText(params.newPass);
        let reNewPassword=checkText(params.reNewPass);
        if(oldPassword.length==0 || newPassword.length==0){
            profileAuth.changePass(req);
            return res.redirect('/admin/changePassword');
        }
        if(newPassword != reNewPassword){
            profileAuth.matchPass(req);
            return res.redirect('/admin/changePassword');
        }
        if(bcrypt.compareSync(oldPassword,req.session.user.password) ){
            let data={};
            data.password=bcrypt.hashSync(newPassword,10);
            userModel.updateOne({_id:req.session.user._id},{$set:data},function(error,data){
                if(error){
                    return res.status(500).json(error);
                }
                req.flash('success','Thay đổi mật khẩu thành công');
                return res.redirect('/admin/')
            })
        }else{
            req.flash("error","Mật khẩu hiện tại không chính xác");
            res.redirect("/admin/changePassword");
        }


    }

}