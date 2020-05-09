const moment = require('moment');
      
module.exports = (sequelize, DataTypes) => {
  const Design = sequelize.define('Design', {
      name: {
        field: "name",
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      thumbnail :{
        type: DataTypes.STRING
      },
      
      writer :{
        type: DataTypes.STRING,
        allowNull : false,
      },
      writer_id : {
        type: DataTypes.BIGINT.UNSIGNED,
       },

      price: {
        field:"price",
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      description: {
        field:"description",
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: true
    });

    // 제품 모델 관계도
    Design.associate = (models) => {
    
      // 메모 모델에 외부키를 건다
      // onDelete 옵션의 경우 제품 하나가 삭제되면 외부키가 걸린 메모들도 싹다 삭제해준다
      Design.hasMany(models.ProductsMemo, {as: 'SMemo', foreignKey: 'Design_id', sourceKey: 'id' , onDelete: 'CASCADE'});
      Design.belongsTo(models.User,{as : 'SOwner',foreignkey:'user_id',targetkey:'id'});
    }, 
  
    // 년-월-일
    Design.prototype.dateFormat = (date) => (
      moment(date).format('YYYY-MM-DD')
  );

  return Design;

  };

