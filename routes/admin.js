const express = require('express'),
    router = express.Router(),
    models = require('../models'),
    loginRequired = require('../helpers/loginRequired'),
    paginate = require('express-paginate');






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

            models.product.findAll({
                include: [
                    {
                        model: models.User,
                        as: 'Owner',
                        attributes: ['username', 'displayname']
                    },
                ],
                limit: req.query.limit,
                offset: req.offset,
                order: [
                    ["createdAt", "desc"]
                ]

            }),
            models.product.count()
        ]);
        const pageCount = Math.ceil(totalCount / req.query.limit);
        const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);
        res.render('admin/products.html', { products, pages, pageCount });
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
    res.render('admin/form.html', { csrfToken: req.csrfToken() });
});



//일어나서 확인하쟈ㅏ, 작성자만 삭제하기 구현완성시켜 술쟁아 + beerBest
router.post('/products/write', upload.single('thumbnail'), csrfProtection,loginRequired, async (req, res) => {

    try{
        var writer = req.user.displayname;

        req.body.thumbnail = (req.file) ? req.file.filename : "";
        await models.product.create(req.body);
        await models.product.update(req.body,{
            where : {
                id : req.body.id
            }
        },{
            SET : {
                writer : writer
            }
        });
        res.redirect('/admin/products');
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
    const user = await models.User.findByPk(req.user.id);
    await user.createProduct(req.body);
    res.redirect('/admin/products');
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

        const product = await models.product.findByPk(req.params.id);
        // create + as에 적은 내용 ( Products.js association 에서 적은 내용 )
        await product.createMemo(req.body)

        // await models.ProductsMemo.create({
        //        content : req.body.console,
        //        product_id : req.params.id
        // });

        res.redirect('/admin/products/detail/' + req.params.id);

    } catch (err) {
        console.log(err)
    }

});





//상세보기 페이지 라우팅 + 댓글 삽입
router.get('/products/detail/:id',loginRequired, async (req, res) => {
    try {
        const product = await models.product.findByPk(req.params.id);
        try {        
            const product1 = await models.product.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    'Memo'
                ]
            });

            res.render('admin/detail.html', { product1,product });
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
router.get('/products/Sucdelete/:id/:id2',loginRequired,async(req,res)=>{
    try{
    const MemoId = req.params.id2;
        models.ProductsMemo.destroy({
            where:{
                id : MemoId
            }
        });
        res.redirect('/admin/products/detail/'+ req.params.id);
    }
    catch(err){
        console.log(err);
    }
});





// 수정페이지 라우팅
router.get('/products/edit/:id', upload.single('thumbnail'), loginRequired,async (req, res) => {
    try {
        const product = await models.product.findByPk(req.params.id);
        res.render('admin/form.html', { product });
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/products/edit/:id', loginRequired, async (req, res) => {
    //기존의 폼에 value안에 값을 셋팅하기 위해서 만든다
    const product = models.product.findByPk(req.params.id);
    res.render('admin/form.html', { product });
});


// 수정내용 업데이트
router.post('/products/edit/:id', upload.single('thumbnail'),loginRequired ,async (req, res) => {
    try {
        //이전에 저장되어있는 파일명을 받아오기
        const product = await models.product.findByPk(req.params.id);

        //요청중에 파일이 존재 할 시 이전이미지 삭제
        if (req.file && product.thumbnail) {
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);
        }

        //파일 요청이면 파일명을 담고 아니면 이전 db에서 가져오기
        req.body.thumbnail = (req.file) ? req.file.filename : product.thumbnail;

        await models.product.update(
            req.body,
            {
                where: { id: req.params.id }
            }
        );
        res.redirect('/admin/products/detail/' + req.params.id);
    }
    catch (err) {
        console.log(err);
    }
});


router.post('/products/edit/:id', loginRequired, async (req, res) => {
    await models.product.update(req.body, {
        where: { id: req.params.id }
    }
    );

    res.redirect('/admin/products/detail/' + req.params.id);
});



//제품 삭제 페이지
router.get('/products/delete/:id' ,loginRequired, async (req, res) => {
    try {
            
        //이전에 저장되어있는 파일명을 받아오기 위해
        const product = await models.product.findByPk(req.params.id);

        if (product.thumbnail) { //요청중에 파일이 존재 할시 이전이미지 삭제
            fs.unlinkSync(uploadDir + '/' + product.thumbnail);
        }

        await models.product.destroy(
            {
                where: { id: req.params.id }
            }
        );
        res.redirect('/admin/products');
    }
    catch (err) {
        console.log(err);
    }
});






router.post('/products/ajax_summernote/', loginRequired, upload.single('thumbnail'), (req, res) => {
    res.send('/uploads/' + req.file.filename);
});




module.exports = router;