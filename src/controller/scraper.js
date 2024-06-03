const scrapeWebsite = require('../helper/scraper');
const ScraperModel = require('../model/scraper');
const {GetOrDefault} = require('../helper/helper');

let scraper = async (req, res) => {
  const {urls} = req.body;
  if (!Array.isArray(urls)) {
    return res
      .status(400)
      .json({data: null, error: {message: 'URLs should be an array'}});
  }

  const results = [];

  for (const url of urls) {
    const data = await scrapeWebsite(url);
    if (data) {
      data.deleteFlag = false;
      const website = new ScraperModel(data);
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
};

let list = async (req, res) => {
  try {
    let filter = req.query;
    let limit = ~~GetOrDefault(filter.limit, 10);
    let sort = GetOrDefault(filter.sort, '-modifiedAt');
    let page = ~~GetOrDefault(filter.page, 1);

    let total = await ScraperModel.countDocuments({deleteFlag: false});
    let model = await ScraperModel.find({deleteFlag: false})
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
};

let getById = async (req, res) => {
  try {
    const websites = await ScraperModel.findById(req.params.id);
    res.status(200).json({data: websites, error: null});
  } catch (error) {
    res
      .status(500)
      .json({data: null, error: {message: 'Failed to fetch data'}});
  }
};

let remove = async (req, res) => {
  try {
    const websites = await ScraperModel.deleteMany({
      _id: {$in: req.body.deleteId},
    });
    res.status(200).json({data: {message: 'Updated successfuly'}, error: null});
  } catch (error) {
    res
      .status(500)
      .json({data: null, error: {message: 'Failed to update data'}});
  }
};

module.exports = {scraper, list, remove, getById};
