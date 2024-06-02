// models/Website.js
const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema(
  {
    url: String,
    name: String,
    description: String,
    logo: String,
    facebookUrl: String,
    linkedinUrl: String,
    twitterUrl: String,
    instagramUrl: String,
    address: String,
    phoneNumber: String,
    email: String,
    screenshotPath: String,
    deleteFlag: Boolean,
  },
  {versionKey: false},
);

module.exports = mongoose.model('Website', WebsiteSchema);
