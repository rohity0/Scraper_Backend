const express = require('express');
const router = express.Router();
const scrapeWebsite = require('../helper/scraper');
const Website = require('../model/Website');
const {GetOrDefault} = require('../helper/helper');
const path = require('path');
const fs = require('fs');

router.post('/scrap', async (req, res) => {
  const {urls} = req.body;

  if (!Array.isArray(urls)) {
    return res.status(400).json({error: 'URLs should be an array'});
  }

  const results = [];

  for (const url of urls) {
    const data = await scrapeWebsite(url);
    if (data) {
      data.deleteFlag = false;
      const website = new Website(data);
      await website.save();
      results.push(website);
    } else {
      results.push({
        data: url,
        error: {message: 'Failed to scrape the website'},
      });
    }
  }

  return res.status(200).json({data: results, error: null});
});

router.get('/list', async (req, res) => {
  try {
    let filter = req.query;
    let limit = ~~GetOrDefault(filter.limit, 10);
    let sort = GetOrDefault(filter.sort, '-modifiedAt');
    let page = ~~GetOrDefault(filter.page, 1);

    let total = await Website.countDocuments({deleteFlag: false});
    let model = await Website.find({deleteFlag: false})
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    res.status(200).send({
      data: model,
      error: null,
      meta: {page, limit, total},
    });
  } catch (error) {
    res
      .status(500)
      .json({data: null, error: {message: 'Failed to fetch data'}});
  }
});

router.get('/get/:id', async (req, res) => {
  try {
    const websites = await Website.findById(req.params.id);
    res.status(200).json({data: websites, error: null});
  } catch (error) {
    res
      .status(500)
      .json({data: null, error: {message: 'Failed to fetch data'}});
  }
});

router.post('/delete', async (req, res) => {
  try {
    const websites = await Website.deleteMany({
      _id: {$in: req.body.deleteId},
    });
    res.status(200).json({data: {message: 'Updated successfuly'}, error: null});
  } catch (error) {
    res
      .status(500)
      .json({data: null, error: {message: 'Failed to update data'}});
  }
});

router.get('/image/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  console.log(__dirname);
  const imagePath = path.join(
    __dirname,
    '..',
    'helper',
    'screenshots',
    imageName,
  );
  console.log(imagePath);
  // Check if the image exists
  fs.access(imagePath, fs.constants.F_OK, err => {
    if (err) {
      return res.status(404).send('Image not found');
    }
    // Send the image file
    res.sendFile(imagePath);
  });
});

module.exports = router;
