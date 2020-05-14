module.exports = (req,res,next)=>{
    if(req.isAuthenticated()){
        res.send('<script>alert("로그아웃이 필요한 서비스입니다.");\
        location.href="/home";</script>');
    }else{
        return next();
    }
};