const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { PORTAL_URL } = require('../config');

describe('Login Test', () => {
  let browser = '';
  let page = '';
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(`${PORTAL_URL}`);
  });

  it('Login should work correctly', async () => {
    await page.type('#loginForm [name="eid"]', 'ahsan');
    await page.type('#loginForm [name="pw"]', '3ratcat3');
    await page.click('#loginForm [name="submit"]');
    await page.waitForSelector('.workspace');
    const username = await page.evaluate(() => {
      return document.querySelector('.Mrphs-userNav__submenuitem--displayid').textContent.trim();
    });
    expect(username).to.be.equal('ahsan');
  });

  afterEach(async () => {
    await browser.close();
  });
});