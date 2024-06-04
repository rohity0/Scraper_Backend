const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async buffer => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({resource_type: 'image'}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      })
      .end(buffer);
  });
};

const scrapeWebsite = async url => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, {waitUntil: 'networkidle2'});

    // Take a full-page screenshot and get the buffer
    const screenshotBuffer = await page.screenshot({fullPage: true});

    const data = await page.evaluate(() => {
      const name = document.title || '';
      const descriptionMeta = document.querySelector(
        'meta[name="description"]',
      );
      const description = descriptionMeta
        ? descriptionMeta.getAttribute('content')
        : '';

      const logoMeta = document.querySelector('meta[property="og:image"]');
      const logo = logoMeta ? logoMeta.getAttribute('content') : '';

      let facebookUrl = '';
      let linkedinUrl = '';
      let twitterUrl = '';
      let instagramUrl = '';
      let address = '';
      let phoneNumber = '';
      let email = '';

      const links = Array.from(document.querySelectorAll('a'));
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          if (href.includes('facebook.com')) {
            facebookUrl = href;
          } else if (href.includes('linkedin.com')) {
            linkedinUrl = href;
          } else if (href.includes('twitter.com')) {
            twitterUrl = href;
          } else if (href.includes('instagram.com')) {
            instagramUrl = href;
          }
        }
      });

      const addressElement = document.querySelector('address');
      if (addressElement) {
        address = addressElement.innerText;
      }

      const phoneElement = document.querySelector('a[href^="tel:"]');
      if (phoneElement) {
        phoneNumber = phoneElement.getAttribute('href').replace('tel:', '');
      }

      const emailElement = document.querySelector('a[href^="mailto:"]');
      if (emailElement) {
        email = emailElement.getAttribute('href').replace('mailto:', '');
      }

      return {
        name,
        description,
        logo,
        facebookUrl,
        linkedinUrl,
        twitterUrl,
        instagramUrl,
        address,
        phoneNumber,
        email,
      };
    });

    // Upload the screenshot buffer to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(screenshotBuffer);

    await browser.close();
    return {url, ...data, screenShotUrl: cloudinaryUrl};
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error scraping website', error);
    return null;
  }
};

module.exports = scrapeWebsite;
