const { Router } = require('express');
const router = Router();

router.use('/', require('../routes/home'));
router.use('/accounts', require('../routes/accounts'));
router.use('/admin', require('../routes/admin'));
router.use('/auth', require('../routes/auth'));
router.use('/chat', require('../routes/chat'));
router.use('/products',  require('./products'));

module.exports = router;