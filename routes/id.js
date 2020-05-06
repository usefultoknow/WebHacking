const express = require('express'),
    router = express.Router(),
    models = require('../models'),
    csrf = require('csurf'),
    csrfProtection = csrf({ cookie: true });

const config = require('./mail_config/config.json');
const nodemailer = require('nodemailer'),
    smtpPool = require('nodemailer-smtp-pool');


let = randomCode = function () {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
    var string_length = 5;
    var simplePasswordCode = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        simplePasswordCode += chars.substring(rnum, rnum + 1);
    };
    //document.randform.randomfield.value = randomstring;
    return simplePasswordCode;
};


let mailsender = async(EMAIL) => {

    var sender = config.mailer.user;
    var receiver = EMAIL;
    var mailTitle = '메일 인증 코드 입니다.';
    var html = randomCode();


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



router.get('/id',csrfProtection,async(req,res)=>{
    res.render('missing/missingid.html');
});


router.post('/id',async(req,res)=>{
    let Email = req.body.email;
    let value = await models.User.findOne({
        where : {
            email : Email
        }
    });
    
    if(req.body.email == value.email){
    let email_value = value.username;
    var sender = config.mailer.user;
    var receiver = Email;
    var mailTitle = '요청하신 아이디 입니다.';
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

    res.send('<script>alert("메일 전송이 완료되었습니다.");\
    location.href="/accounts/login";</script>');
    }
    else{
        res.send('<script>alert("일치하는 이메일이 없습니다.");\
        location.href="/missingId/id";</script>');
    }
    
});

module.exports = router;

