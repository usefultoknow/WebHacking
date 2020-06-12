const express = require('express'),
      router = express.Router(),
      csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true }),
      models =  require('../models'),
      passwordHash = require('../helpers/passwordHash'),
      mkrmpw = require('../helpers/mkrmpw');

    const config = require('./mail_config/config.json');
    const nodemailer = require('nodemailer');
    const smtpPool = require('nodemailer-smtp-pool');




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
                name : req.body.name,
                email : req.body.email,
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
            
                let Email = req.body.email;
                let value = await models.User.findOne({
                    where : {
                        email : Email
                    }
                });
                
                if(req.body.email == value.email){
                let email_value = mkrmpw;
                var sender = config.mailer.user;
                var receiver = Email;
                var mailTitle = '요청하신 임시 패스워드 입니다.';
                var html = email_value;


                var mailOptions = {
                    from: sender,
                    to: receiver,
                    subject: mailTitle,
                    html: html
                };

                var MailTransporter = await nodemailer.createTransport(smtpPool({

                    service: config.mailer.service,
                    host: config.mailer.host,
                    port: config.mailer.port,
                    auth: {
                        user: config.mailer.user,
                        pass: config.mailer.password
                    },
                    tls: {
                        rejectUnauthorize: false
                    },
                    maxConnections: 5,
                    maxMessages: 10
                }));
            
                await MailTransporter.sendMail(mailOptions, async () => {
                    await MailTransporter.close();
                });
            };
                
            let newPassword = passwordHash(mkrmpw);
            await models.User.update({
                password : newPassword
            },{
                where : {
                    email : req.body.email
                }
            });
        

            res.send('<script>alert("인증 성공 입니다.입력하신 이메일로 임시 비밀번호가 전송되었습니다.");\
        location.href="/accounts/login";</script>');
    }     
    }
    catch(err){
        console.log(err);
    }
});




/*
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
        await models.User.update({
            password :Password
        },{
            where : {
                username : ConfirmId
            }
        });
    }
    catch(err){
        console.log(err);
    }

    res.send('<script>alert("패스워드 변경완료");\
            location.href="/accounts/login";</script>');
});
*/


module.exports = router;