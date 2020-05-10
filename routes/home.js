const express = require('express'),
      router = express.Router(),
      models = require('../models'),
      loginRequired = require('../helpers/loginRequired');
      



router.get('/',loginRequired,async(req,res)=>{
    try{

        const Dress = await models.Dress.findAll({
            include : [
                {
                    model : models.User,
                    as : 'DOwner',
                    attributes : ['username','displayname']
                },
            ]
        });

        /* 자유게시판은 표시 안할꺼면 이렇게
        const products = await models.product.findAll({
            include : [
                {
                    model : models.User,
                    as : 'Owner',
                    attributes : ['username','displayname']
                },
            ]
        });
        */

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
        res.render('home.html',{Dress,Design});
    }
    catch(err){
        console.log(err);
    }
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
