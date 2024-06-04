const express = require('express');
const router = express.Router();
const {scraper, list, remove, getById} = require('../controller/scraper');

router.post('/scrap', scraper);

router.get('/list', list);

router.get('/get/:id', getById);

router.put('/delete', remove);

module.exports = router;
