const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      loginRequired = require('../helpers/loginRequired');



// GET home page
router.get('/',loginRequired,async(_,res)=>{
    const products = await models.product.findAll({
        include : [
            {
                model : models.User,
                as : 'Owner',
                attributes : ['username','displayname']
            },
        ]
    });
//console.log(models.product.findAll());
    res.render('home.html',{products});
});

module.exports=router;
