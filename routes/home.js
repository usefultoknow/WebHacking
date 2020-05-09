const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      loginRequired = require('../helpers/loginRequired');



router.get('/',loginRequired,async(_,res)=>{
        const Dress = await models.Dress.findAll({
            include : [
                {
                    model : models.User,
                    as : 'DOwner',
                    attributes : ['username','displayname']
                },
            ]
        });
        const products = await models.product.findAll({
            include : [
                {
                    model : models.User,
                    as : 'Owner',
                    attributes : ['username','displayname']
                },
            ]
        });
        const Design = await models.Design.findAll({
            include : [
                {
                    model : models.User,
                    as : 'SOwner',
                    attributes : ['username','displayname']
                },
            ]
        });
    //console.log(models.product.findAll());
        res.render('home.html',{Dress,products,Design});
    });      




    /*
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
*/

module.exports=router;
