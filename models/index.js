//models 폴더는 Model을 정의한 js 파일들을 모아놓은 폴더
//models/index.js : model을 정의하고 관계를 설정해주는 역할

var path = require('path');
const Sequelize = require('sequelize');
const fs = require('fs');
const dotenv = require('dotenv');

/*
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);
*/
dotenv.config(); //LOAD CONFIG

const sequelize = new Sequelize( process.env.DATABASE,
    process.env.DB_USER, process.env.DB_PASSWORD,{
        host: process.env.DB_HOST,
        connection:process.env.DB_CONNECTION,
        port:'3306',
        dialect: 'mysql',
        timezone: '+09:00', //한국 시간 셋팅
        operatorsAliases: Sequelize.Op,
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        }
    });
    
    let db = [];



    
    

//여러 모델들을 한 객체(db)에 담아 반환하는 구문,models 폴더 내에 Model을 정의하면, 반복문을 돌면서 Model들을 취합
//모델을 정의하는 과정일뿐 실제 프로젝트 내에 모델을 등록하는 것은 sync()메소드에 의해서 성립
    fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf(".") !== 0)  && (file !== "index.js");
    })
    .forEach((file) => {  //foreach로 배열 반복문, 배열을 다 돌때까지 쭉
        var model = sequelize.import(path.join(__dirname, file)); //현재 폴더 내의 모든 파일들을 불러오기,import 메서드는 파일에 있는 Model 정의들과 완벽히 같은 object를 생성
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if(db[modelName].associate){
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;