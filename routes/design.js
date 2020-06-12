const express = require('express'),
    router = express.Router(),
    models = require('../models'),
    loginRequired = require('../helpers/loginRequired'),
    paginate = require('express-paginate');

    const Protection = require('../helpers/Protection');


//db 시퀄라이저 연산 명령
const sequelize = require('sequelize'),
      Op = sequelize.Op;


//이미지 저장되는 위치 설정
var path = require('path');
const uploadDir = path.join(__dirname, '../uploads'); // 루트의 uploads위치에 저장한다.
const fs = require('fs');


//multer 셋팅
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => { //이미지가 저장되는 도착지 지정
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => { // products-날짜.jpg(png) 저장 
        callback(null, 'products-' + Date.now() + '.' + file.mimetype.split('/')[1]);
    }
});
const upload = multer({ storage: storage });

//csrf 방어
var csrf = require('csurf'),
    csrfProtection = csrf({ cookie: true });


//홈화면
router.get('/',loginRequired, (req, res) => {
    res.send('루트 경로 추후 설정 beer best');
});



//products 변수에 DB에 테이블을 findAll 해서 그것에 대한 내용을 담고 products.html에 데이터 전달
//리스트
/*
router.get('/products',async(_,res)=>{
    try{
        const products = await models.product.findAll();
        res.render('admin/products.html',{products});
    }
    catch(err)
    {
        console.log(err);
    }
});    
*/


 
router.get('/products', paginate.middleware(3, 50),loginRequired, async (req, res) => { //middlware(3,50) : [page당 게시물 수],[page당 최대 게시물 수 제한]
    try {
        const [products, totalCount] = await Promise.all([

            models.Design.findAll({
                include: [
                    {
                        model: models.User,
                        as: 'SOwner',
                        attributes: ['username', 'displayname']
                    },
                ],
                limit: req.query.limit,
                offset: req.offset,
                order: [
                    ["createdAt", "desc"]
                ]

            }),
            models.Design.count()
        ]);
        const pageCount = Math.ceil(totalCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);
        res.render('design/products.html', { products, pages, pageCount });
    }
    catch (err) {
        console.log(err);
    }
});






//구매작성 페이지
///products/write로 admin/form.html의데이터 전달,form.html을 화면에 띄우기
/*
수정전
router.get('/products/write',(_,res)=>{
    res.render('admin/form.html');
})
*/

router.get('/products/write', csrfProtection,loginRequired, function (req, res) {
    res.render('design/form.html', { csrfToken: req.csrfToken() });
});



//
router.post('/products/write', upload.single('thumbnail'), csrfProtection,loginRequired, async (req, res) => {

    try{
        req.body.writer = req.user.displayname;

        let Thumbnail =await (req.body.thumbnail = (req.file) ? req.file.filename : "");

        
        let extName = path.extname(Thumbnail);

        if(extName != 'gif' || extName != '.png' || extName != 'jpg' || extName != 'jpeg')
        {
            return res.send('<script>alert("gif,png,jpg,jpeg 파일만 업로드 할수 있습니다.");\
            location.href="/design/products/write";</script>');
        }

        req.body.name = Protection.cleanXss(req.body.name);
        req.body.description = Protection.cleanXss(req.body.description);

        await models.Design.create({
            name : req.body.name,
            thumbnail : Thumbnail,
            price : req.body.price,
            description : req.body.description,
            writer : req.user.displayname,
            writer_id : req.user.id
        });
        res.redirect('/design/products');
    }
    catch(err){
        console.log(err);
    }
    
});

/*
router.post('/products/write',csrfProtection,loginRequired,async(req,res)=>{
   try{
        await models.product.update(req.user,{
            where:{
                id : req.user.id
            }
        },{SET :{
            writer : req.user.displayname
        }});
        res.redirect('/admin/products');
   } 
   catch(err){
       console.log(err);
   }
});
*/

router.post('/products/write',csrfProtection ,loginRequired, async (req, res) => {

    //유저를 가져온다음에 저장
    req.body.name = Protection.cleanXss(req.body.name);
    req.body.description = Protection.cleanXss(req.body.description);

    const user = await models.User.findByPk(req.user.id);
    await user.createDesign(req.body);
    res.redirect('/design/products');
});



/* 
수정전
router.post('/products/write',async(req,res)=>{
    try{
        await models.product.create(req.body); //req.body에 들어있는 name값을 통해 product 테이블 채우기(create)
        res.redirect('/admin/products');        
    }
    catch(err)
    {
        console.log(err);
    }
});
*/


//댓글 데이터 db 저장
router.post('/products/detail/:id',loginRequired, async (req, res) => {

    try {

        const product = await models.Design.findByPk(req.params.id);
        req.body.content = Protection.cleanXss(req.body.content);
        // create + as에 적은 내용 ( Products.js association 에서 적은 내용 )
        await product.createSMemo({
            content : req.body.content,
            Design_id  : req.params.id,
            commenter : req.user.displayname,
            commenter_id : req.user.id
        });

        // await models.ProductsMemo.create({
        //        content : req.body.console,
        //        product_id : req.params.id
        // });

        res.redirect('/design/products/detail/' + req.params.id);

    } catch (err) {
        console.log(err)
    }

});





//상세보기 페이지 라우팅 + 댓글 삽입
router.get('/products/detail/:id',loginRequired,csrfProtection, async (req, res) => {
    try {
        const product = await models.Design.findByPk(req.params.id);
        if(!product)
        {
         return res.send('<script>alert("없는 페이지 입니다.");\
                  location.href="/design/products";</script>');
        }
        try {        
            const product1 = await models.Design.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    'SMemo'
                ]
            });
            res.render('design/detail.html', { product1,product,csrfToken: req.csrfToken()});
        }
        catch (err) {
            console.log(err);
        }
    }

    catch (err) {
        console.log(err);
    }
});


//댓글 삭제
router.get('/products/Sucdelete/:id/:id2/:id3',loginRequired,async(req,res)=>{
    try{
        if(req.user.id == req.params.id2){
            const MemoId = req.params.id3;
            models.ProductsMemo.destroy({
                where:{
                    id : MemoId
                }
            });
            res.redirect('/design/products/detail/'+ req.params.id);
        }
        else if(req.user.username == "lde9867"){
            const MemoId = req.params.id3;
            models.ProductsMemo.destroy({
                where:{
                    id : MemoId
                }
            });
            res.redirect('/design/products/detail/'+ req.params.id);
        }
        else{
            res.send('<script>alert("삭제 권한이 없습니다.");\
                    location.href="/design/products";</script>');
        }

    }
    catch(err){
        console.log(err);
    }
});





// 수정페이지 라우팅
router.get('/products/edit/:id/:id2', upload.single('thumbnail'), loginRequired,async (req, res) => {
    try {
        if(req.user.id != req.params.id2){        
                res.send('<script>alert("수정할 권한이 없습니다.");\
                location.href="/design/products";</script>');  
        }
        else{
            const product = await models.Design.findByPk(req.params.id);
            res.render('design/form.html', { product });     
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/products/edit/:id/:id2', loginRequired, async (req, res) => {
    //기존의 폼에 value안에 값을 셋팅하기 위해서 만든다
    const product = models.Design.findByPk(req.params.id);
    res.render('design/form.html', { product });
});


// 수정내용 업데이트
router.post('/products/edit/:id/:id2', upload.single('thumbnail'),loginRequired ,async (req, res) => {
    try {
        //이전에 저장되어있는 파일명을 받아오기
        const product = await models.Design.findByPk(req.params.id);

        //요청중에 파일이 존재 할 시 이전이미지 삭제
        if (req.file && product.thumbnail) {
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);
        }

        //파일 요청이면 파일명을 담고 아니면 이전 db에서 가져오기
        req.body.thumbnail = (req.file) ? req.file.filename : product.thumbnail;
        req.body.writer = req.user.displayname;

        req.body.name = Protection.cleanXss(req.body.name);
        req.body.description = Protection.cleanXss(req.body.description);

        await models.Design.update(
            req.body,
            {
                where: { id: req.params.id }
            }
        );
        res.redirect('/design/products/detail/' + req.params.id);
    }
    catch (err) {
        console.log(err);
    }
});


router.post('/products/edit/:id/:id2', loginRequired, async (req, res) => {
    await models.Design.update(req.body, {
        where: { id: req.params.id }
    }
    );

    res.redirect('/design/products/detail/' + req.params.id);
});





//검색기능 페이지
router.get('/products/search',paginate.middleware(3, 50),loginRequired,csrfProtection,async(req,res)=>{
    try{
         //pagenate기능
         const [products, totalCount] = await Promise.all([

            models.Design.findAll({
                include: [
                    {
                        model: models.User,
                        as: 'SOwner',
                        attributes: ['username', 'displayname']
                    },
                ],
                limit: req.query.limit,
                offset: req.offset,
                order: [
                    ["createdAt", "desc"]
                ]

            }),
            models.Design.count()
        ]);
        const pageCount = Math.ceil(totalCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

         //검색기능
         let Name = "name";
         let Writer = "writer";
 
         if(req.query.choice == Name){
             let namekeyword = req.query.search;
             const productsName = await models.Design.findAll({
                where : {
                    name: {
                        [Op.like] : '%' + namekeyword + '%'
                    }
                }
             });
             res.render('design/search.html', {productsName,pageCount,pages,products,csrfToken: req.csrfToken()} );
         }
         else if(req.query.choice == Writer){
             let writerkeyword = req.query.search;
             const productsWriter = await models.Design.findAll({
                where : {
                    name: {
                        [Op.like] : '%' + writerkeyword + '%'
                    }
                }
             });
             res.render('design/search.html',{productsWriter,pageCount,pages,products,csrfToken: req.csrfToken()} ); 
         }
         else{
             res.send('<script>alert("검색한 결과가 없습니다.");\
             location.href="/design/products";</script>');
         }
    }
    catch(err){
        console.log(err);
    }
});





/*
//검색기능 처리
router.get('/products/search',paginate.middleware(3, 50),loginRequired,csrfProtection,async(req,res)=>{
    try{   
        //검색기능
        let Name = "name";
        let Writer = "writer";

        if(req.query.choice == Name){
            const productsName = await models.product.findAll({
                where : {
                    name: req.query.search
                }
            });
            res.render('admin/search.html', {productsName,pageCount,pages,products,csrfToken: req.csrfToken()} );
        }
        else if(req.query.choice == Writer){
            const productsWriter = await models.product.findAll({
                where : {
                    writer: req.query.search
                }
            });
            res.render('admin/search.html',{productsWriter,pageCount,pages,products,csrfToken: req.csrfToken()} ); 
        }
        else{
            res.send('<script>alert("검색한 결과가 없습니다.");\
            location.href="/admin/products";</script>');
        }
    }
    catch(err){
        console.log(err);
    }
})
*/






//제품 삭제 페이지
router.get('/products/delete/:id' ,loginRequired, async (req, res) => {
    try {
            
        //이전에 저장되어있는 파일명을 받아오기 위해
        const product = await models.Design.findByPk(req.params.id);
        /*
        if (product.thumbnail) { //요청중에 파일이 존재 할시 이전이미지 삭제
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);    
        }
        */
       
        if(product.writer===req.user.displayname){
        await models.Design.destroy(
            {
                where: { id: req.params.id }
            }
              );
        res.redirect('/design/products');
         }
         else if(req.user.username == "lde9867"){
            await models.Design.destroy(
                {
                    where: { id: req.params.id }
                }
                  );
            res.redirect('/design/products');
        }
         else{
             res.send('<script>alert("유효하지 않은 권한입니다. 삭제할 수 없습니다.");\
                        location.href="/design/products";</script>');
         }
         
     }
    catch (err) {
        console.log(err);
    }
});




router.post('/products/ajax_summernote/', loginRequired, upload.single('thumbnail'), (req, res) => {
    res.send('/uploads/' + req.file.filename);
});




module.exports = router;