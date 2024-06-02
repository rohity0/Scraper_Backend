// scraper.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ensureDirectoryExistence = filePath => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const scrapeWebsite = async url => {
  let browser;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'networkidle2'});

    // Define the screenshot path
    const screenshotFilename = `${new Date().getTime()}.png`;
    const screenshotPath = path.join(
      __dirname,
      'screenshots',
      screenshotFilename,
    );

    // Ensure the directory exists
    ensureDirectoryExistence(screenshotPath);

    // Take a full-page screenshot
    await page.screenshot({path: screenshotPath, fullPage: true});

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

    await browser.close();
    return {url, ...data, screenshotPath: screenshotFilename};
  } catch (error) {
    if (browser) await browser.close();
    console.error('Error scraping website', error);
    return null;
  }
};

module.exports = scrapeWebsite;
