const express = require('express'),
      router = express.Router(),
      models = require('../../models');

router.get('/:id',async(req,res)=>{
    try{
        const product = await models.product.findByPk(req.params.id);
        res.render('products/detail.html',{product});
    }
    catch(err){
        console.log(err);
    }

});

module.exports= router;

