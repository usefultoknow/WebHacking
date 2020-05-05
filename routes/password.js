const express = require('express'),
      router = express.Router(),
      csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true }),
      models =  require('../models'),
      passwordHash = require('../helpers/passwordHash');




      //자기 확인
router.get('/password',csrfProtection,async(req,res)=>{
    try{
        res.render('missing/confirm.html',{csrfProtection});
    }
    catch(err){
        console.log(err);
    }

});



router.post('/password',async(req,res)=>{
    try{
        const confirm = await models.User.findOne({
            where : { 
                username : req.body.username,
                gender : req.body.gender,
                Year : req.body.Year,
                Month : req.body.Month,
                Day : req.body.Day
            }
        })
        if(!confirm){
            res.send('<script>alert("인증에 실패하셨습니다.");\
        location.href="/missing/password";</script>');
        }
        else{
            res.send('<script>alert("인증 성공 입니다.");\
        location.href="/missing/password/change";</script>');
    }     
    }
    catch(err){
        console.log(err);
    }
});




//패스워드 변경
router.get('/password/change',csrfProtection,async(req,res)=>{
    try{
        res.render('missing/change.html',{csrfProtection});
    }
    catch(err){
        console.log(err);
    }
});


router.post('/password/change',async(req,res)=>{
    try{

        const ConfirmId = req.body.username;
        const Password = passwordHash(req.body.password);
        console.log(Password,'#######################');
        await models.User.update(Password,{
            where : {
                username : ConfirmId
            }
        });
    }
    catch(err){
        console.log(err);
    }

    res.redirect('/accounts/login');
});



module.exports = router;