const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      passwordHash = require('../helpers/passwordHash'),
      loginRequired = require('../helpers/loginRequired'),
      logoutRequired = require('../helpers/logoutRequired');

      var csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true });


      //변경확인
      router.get('/',loginRequired,csrfProtection,async(req,res)=>{
          try{
            res.render('changepw/changepw.html',{csrfToken: req.csrfToken()});

          }
          catch(err){
            console.log(err);
          }
      });


      router.post('/',loginRequired,async(req,res)=>{

        try{
            let confirmpasswd = passwordHash(req.body.password);
            const identificationPasswd = await models.User.findOne({
                where : {
                    id : req.user.id
                }
            });


            if(confirmpasswd == identificationPasswd.password)
            {
               
                     res.send('<script>alert("인증 성공");\
                     location.href="/changepasswd/change";</script>');         
            }
            else{
                res.send('<script>alert("패스워드가 일치하지 않습니다.");\
                location.href="/changepasswd";</script>');
            }

        }
        catch(err){
            console.log(err);
        }


      });


      //변경요청
      router.get('/change',loginRequired,csrfProtection,async(req,res)=>{
        try{
            res.render('changepw/changepasswd.html',{csrfToken : req.csrfToken()});

        }
        catch(err){
            console.log(err);
        }

      });




      router.post('/change',async(req,res)=>{
        try{
            let value = passwordHash(req.body.password);

            await models.User.update(
                { password : value
          },{
                where : {
                    id : req.user.id
                }
            }); 
                req.logout();
                res.send('<script>alert("패스워드 변경완료,재 로그인이 필요합니다.");\
                location.href="/accounts/login";</script>');
            

        }
        catch(err){
            console.log(err);
        }

      });      
      



    module.exports=router;