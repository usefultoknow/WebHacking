let http = require('http');

http.createServer(function(request,response){
    response.writeHead(200); //응답 헤더 작성
    response.write('Hello Nodejs');
    response.end(); //응답 본문 작성


}).listen(8080);

