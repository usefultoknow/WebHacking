const moment = require('moment');

module.exports =(sequelize, DataTypes)=>{
    const ProductsMemo = sequelize.define('ProductsMemo',
        {
            id:{ 
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true 
            },
            commenter :{
                type: DataTypes.STRING,
                allowNull : false,
              },
            commenter_id : {
                type: DataTypes.BIGINT.UNSIGNED,
            },
            content :  { 
                type: DataTypes.TEXT,
                validate : {
                    len : [0, 500],
                } 
            }
        },{
            tableName: 'ProductsMemo'
        }
    );


    // 년-월-일
    ProductsMemo.prototype.dateFormat = (date) => (
        moment(date).format('YYYY-MM-DD // h:mm')
    );

    return ProductsMemo;
}