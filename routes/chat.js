const express = require('express'),
      router = express.Router(),
      Protection = require('../helpers/Protection');
//csrf 방어
var csrf = require('csurf'),
    csrfProtection = csrf({ cookie: true });

    
router.get('/',csrfProtection,(req,res)=>{
    if(!req.isAuthenticated()){
        res.send('<script>alert("로그인이 필요한 서비스입니다.");\
        location.href="/accounts/login";</script>');
    }else{
        res.render('chat/index.html',{ csrfToken: req.csrfToken() });
    } 
});


module.exports = router;
