const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/rates', require('./rates'));
router.use('/info', require('./info'));
router.use('/services', require('./services'));


module.exports = router;
