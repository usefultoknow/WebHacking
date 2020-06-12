const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy, //passport는 "어떤 로그인 방식을 취하냐"를 대명사로 strategy(전략)이라고 나타낸다.
      passwordHash = require('../helpers/passwordHash'),
      loginRequired = require('../helpers/loginRequired'),
      logoutRequired = require('../helpers/logoutRequired'),
      Protection = require('../helpers/Protection');

      var csrf = require('csurf'),
      csrfProtection = csrf({ cookie: true });
  
      

//로그인 세션생성,유지와 성공시,실패시 페이지 or 메시지  
passport.use(new LocalStrategy({ //local 전략을 세움
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그래도 전달할지 여부를 결정
},
    async (req, username, password, done) => {
        // 조회
        const user = await models.User.findOne({
            where: {
                username,
                password: passwordHash(password),
            },
            // attributes: { exclude: ['password'] }
        });
        // 유저에서 조회되지 않을시
        if (!user) {
            return done(null, false, { message: '일치하는 아이디 패스워드가 존재하지 않습니다.' });

            // 유저에서 조회 되면 세션등록쪽으로 데이터를 넘김
        } else {
            return done(null, user );
        }
    }
));

//로그인에 성공할 시 serializeUser 메소드를 통해서 사용자 정보를 Session에 저장
//성공시 user의 값이 user에 들어가게 되고 이 값을 Session에 저장
passport.serializeUser(  (user, done) => {
    console.log(user);
    done(null, user);
});

//로그인에 성공하게 되면 Session 정보 저장을 완료했기에 이제 페이지 접근 시마다 사용자 정보를 Session에 갖게 된다.
//인증이 완료되고 페이지 이동시 deserializeUser 메소드가 호출된다.
passport.deserializeUser(  (user, done) => {
    const result = user;
    console.log(result);
    result.password = "";
    done(null, result);
});




//회원가입 페이지
router.get('/join',logoutRequired,(_,res)=>{
    res.render('accounts/join.html');
});






//로그인 페이지
router.get('/login',logoutRequired ,( req , res) => {
    res.render('accounts/login.html', { flashMessage : req.flash().error } );
});




//로그인 성공,실패 여부
router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, message) {
        if (!user) {
            return req.session.save(function () {
                req.flash("error", message.message);
                return res.redirect('/accounts/login');
            })
        }
        req.login(user, function () {
            return req.session.save(function () {
                return res.send('<script>alert("로그인 성공");\
                location.href="/home";</script>/');
            });
        });
    })(req, res, next)
});








//성공 페이지
router.get('/success',(req,res)=>{
    res.send(req.user);
});





//로그아웃
router.get('/logout',async(req,res)=>{
    try{
    req.logout();
    req.session.save(()=>{
        res.send('<script>alert("로그아웃 하셨습니다.");\
        location.href="/accounts/login";</script>');
    });
    }
    catch(err){
        console.log(err);
    }
});





//회원가입 성공메시지 + DB에 데이터 저장
router.post('/join',async(req,res)=>{
    try{
       const Confirm1 = await models.User.findOne({
            where : {
                username : req.body.username
            }
        });
       const Confirm2 = await models.User.findOne({
            where : {
                displayname : req.body.displayname
            }
        });

        const Confirm3 = await models.User.findOne({
            where : {
                email : req.body.email
            }
        });

        if(Confirm1){
           return res.send('<script>alert("동일한 id가 있습니다.");\
        location.href="/accounts/join";</script>');
        }
        else if(Confirm2){      
                res.send('<script>alert("동일한 닉네임이 있습니다.");\
                location.href="/accounts/join";</script>');
        }
        else if(Confirm3){      
            res.send('<script>alert("동일한 이메일이 있습니다.");\
            location.href="/accounts/join";</script>');
    }
        else{ 
        
        req.body.username = Protection.checkCID(req.body.username,res);
        req.body.displayname = Protection.checkNickName(req.body.displayname,res);
        req.body.email = Protection.checkEmail(req.body.email,res);
        req.body.password = Protection.checkPassword(req.body.password, req.body.password2, res)
            

        await models.User.create(req.body);     
        res.send('<script>alert("회원가입 성공");\location.href="/accounts/login";</script>');
        }
    }
    catch(err){
        console.log(err);
    }
});


//회원정보 넘겨주기
router.get('/information',loginRequired,csrfProtection,async(req,res)=>{
    try{
   
    const users = await models.User.findOne({
        where : {
           id : req.user.id
        }
    });

    res.render('Information/information.html',{users,csrfToken: req.csrfToken()});

    }
    catch(err){
        console.log(err);
    }
    
});






module.exports= router;
