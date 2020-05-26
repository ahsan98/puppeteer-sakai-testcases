const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { PORTAL_URL } = require('../config');

describe('Chat room tests from Member', () => {
  let browser = '';
  let page = '';
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    page.setViewport({ width: 1366, height: 768 });

    // Login before the test case
    await page.goto(`${PORTAL_URL}`);
    await page.type('#loginForm [name="eid"]', 'ahsan-2');
    await page.type('#loginForm [name="pw"]', '3ratcat3');
    await page.click('#loginForm [name="submit"]');
    await page.waitForSelector('.workspace');

    // Goto the test project site created
    await page.goto(`${PORTAL_URL}/site/bb1f5109-01b4-40d5-988b-d43abbda5381/page/36cf0ac0-701f-4389-92a1-dc0f4d4e7b74`);
  });

  it('should be loaded correctly', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const title = await page.evaluate(() => {
      return document.querySelector('[title="Tool Home"] span:last-of-type').textContent.trim().toLowerCase();
    });
    expect(title).to.be.equal('chat room');
  });

  it('should not show actions toolbar for configuration since user is access right only', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const optionsShown = await page.evaluate(() => {
      return !!document.querySelector('.navIntraTool.actionToolbar');
    });

    expect(optionsShown).to.not.be.true;
  });

  afterEach(async () => {
    await browser.close();
  });
});