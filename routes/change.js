const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      loginRequired = require('../helpers/loginRequired'),
      csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true });



router.get('/',loginRequired,csrfProtection, async(req,res)=>{
        try{
       users = await models.User.findOne({
               where : {
                       id : req.user.id
               }
       });


        res.render('change/change.html',{users,csrfToken: req.csrfToken()});
        }
        catch(err){
        console.log(err);
        }

});


router.post('/',loginRequired,async(req,res)=>{
           try{    
                        await models.User.update(req.body,{
                        where : {
                                displayname : req.user.displayname
                        }
                },{
                SET : {        
                        phone : req.body.phone,
                        name : req.body.name,
                        gender : req.body.gender,
                        Year : req.body.Year,
                        Month : req.body.Month,
                        Day : req.body.Day
                }
                });
                res.send('<script>alert("사용자 정보가 변경되었습니다.");\
                location.href="/accounts/information";</script>');
          }
        catch(err){
                console.log(err);
        }
        });





module.exports=router;


