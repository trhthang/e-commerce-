const session=require("express-session");
module.exports={
    isLogin:(req,res,next)=>{
        if(req.session.user){
            next();
        }else{
            req.flash("error","Vui lòng đăng nhập trước");
            res.redirect('/admin/login');
        }
    },
    isCheck:(req,res,next)=>{

        if(!req.session.user){
            next();
        }else{
            req.flash("success","Bạn đã đăng nhập");
            res.redirect('/admin/');
            console.log("as");
        }
    }
}