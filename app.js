const express = require('express'),
      app = express(),
      https = require('https'),
      httpport = 5000, //test port 추후 80이용
      httpsport = 3000, //https port
      nunjucks = require('nunjucks'),
      logger = require('morgan'), //로그 미들웨어
      bodyParser = require('body-parser'), 
      models =require('./models/index.js'),
      cookieParser = require('cookie-parser'),
      accounts = require('./routes/accounts'),
      auth = require('./routes/auth'),
      loginRequired = require('./helpers/loginRequired'),
      home = require('./routes/home'),
      fs =require('fs'),
      chat = require('./routes/chat'),
      request = require('request'),
      controllers = require('./controllers/index'),
      missing = require('./routes/password'),
      missingid = require('./routes/id'),
      helmet = require('helmet'),
      xssFilter = require('xss-filters'),
      dress = require('./routes/dress'),
      design = require('./routes/design'),
      change = require('./routes/change'),
      withdraw = require('./routes/withdraw');
      

const options = {
    key : fs.readFileSync('./SSLconfig/private.key'),
    cert: fs.readFileSync('./SSLconfig/server.crt')
};
     
      
      
      
      
   
    
    

      nunjucks.configure('template',{
          autoescape:true,
          express:app
      });



//flash 메시지 관련 모듈    
const flash = require('connect-flash');

//passport 로그인 관련
const passport = require('passport'),
      session = require('express-session');

//라우팅
let admin = require('./routes/admin.js');




//미들웨어 셋팅
app.use(logger('dev'));
app.use(logger('combined',{stream:fs.WriteStream('./serverlog.log')}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/css',express.static('css'));
app.use('/js',express.static('js'));
app.use('/img',express.static('img'));
app.use('/uploads', express.static('uploads'));
app.locals.req_path = request.path;
app.use(helmet());


//db session 관련 셋팅
const db = require('./models');

const Sequelize = require('sequelize'),
      SequelizeStore = require('connect-session-sequelize')(session.Store);
const sessionMiddleWare = session({
    secret: 'webhack',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 30 * 10 //지속시간 2시간
    },
    store: new SequelizeStore({
        db: db.sequelize
    }),
});
app.use(sessionMiddleWare);


/*Db 세션으로 바꿈
//session 관련 셋팅
app.use(session({
    secret : 'webhack',
    resave: false,
    saveUninitialized : true,
    cookie : {
        maxAge: 2000 * 60 * 60 //지속시간 2시간 설정
    }
}));
*/


//passport 적용
app.use(passport.initialize()); //passport를 미들웨어로 장착
app.use(passport.session()); //passport가 session을 사용할 수 있도록 하는 미들웨어


//플래시 메시지 관련
app.use(flash());


//네비게이션,메뉴바
app.use((req,res,next)=>{
    //app.locals.myname ="nodejs";
    app.locals.isLogin = req.isAuthenticated();
    //app.locals.urlparameter =req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
    //app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅
    next();
});





//get - 웹 브라우저에서 url을 입력 시 응답하는 부분
app.use('/admin',admin);
app.use('/dress',dress);
app.use('/design',design);

//회원가입 페이지
app.use('/accounts',accounts);

//home 화면
app.use('/',home);


//chat 화면
app.use('/chat',chat);


//페이스북 로그인
app.use('/auth', auth);


//상세보기 페이지
app.use('/products',controllers);


//비밀번호 찾기
app.use('/missing',missing);


//아이디 찾기
app.use('/missingid',missingid);

//사용자 정보변경
app.use('/change',change);

//회원탈퇴
app.use('/withdraw',withdraw);

//sync() 메서드를 호출하여 models 폴더에서 정의된 모델들을 바탕으로 실제로 Model을 등록

models.sequelize.sync().then( () =>{
    console.log("DB 연결 성공");
}).catch(err =>{
    console.log("연결실패");
    console.log(err);
});


//테이블 생성시 싱크해주기 위해서 한번 실행
// return models.sequelize.sync();




//잘못된 접근 + 404 오류 구현하기
app.use(function (req, res, next) {
    res.status(404).send("404 Not Found");
});
//잘못된 접근 + 500 오류 구현하기
app.use(function (req, res, next) {
    res.status(500).send("500 Error occurred");
});


/*httpport
const server =app.listen(httpport,()=>{
    console.log('Express listening on port',httpport);
       });
*/

//httpsport
const server = https.createServer(options,app).listen(httpsport,async()=>{
    try{
        console.log('서버가 실행되었습니다.',httpsport);
    }
    catch(err){
        console.log('https 서버 실행에 문제가 있습니다.');
    }
       });



//listen
const listen = require('socket.io'),
      io = listen(server);
io.use((socket,next)=>{
    sessionMiddleWare(socket.request,socket.request.res,next);
});
      require('./helpers/socketConnection')(io);

/*
 const server =app.listen(httpport,()=>{
 console.log('Express listening on port',httpport);
    });
    
 const listen = require('socket.io'),
          io =listen(server);
    
 io.on('connection',(socket)=>{
        console.log('소켓 작동');
        socket.on('client mesaage',(data)=>{
            console.log(data);
            io.emit('Server message',data.message);
        
        });
     });
    */