const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      loginRequired = require('../helpers/loginRequired'),
      csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true });

      const Protection = require('../helpers/Protection');



    router.get('/',loginRequired,csrfProtection, async(req,res)=>{
            res.render('withdraw/withdraw.html');
    });


    router.post('/',loginRequired,async(req,res)=>{
        try{

        const user = await models.User.findOne({
                where : {
                    id : req.user.id
                }
        });
        console.log('####################################',user);
           //보안상 문제로 어떤 정보가 일치하지 않는지 알려주지 않음
            if((user.username == req.body.username) && (user.displayname == req.body.displayname) && (user.email == req.body.email) ){
            await models.User.destroy({
                where : {
                   id : req.user.id
                }
            });
            req.logout();
            res.send('<script>alert("탈퇴에 성공하셨습니다. 기회가 되신다면 또 이용해주시면 감사하겠습니다.");\
            location.href="/accounts/login";</script>');
        }else{
            res.send('<script>alert("회원정보가 일치하지 않습니다.");\
            location.href="/withdraw";</script>');
        }
        }
        catch(err){
            console.log(err);        }
    });


    
    module.exports = router;