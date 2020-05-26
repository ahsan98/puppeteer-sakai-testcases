const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { PORTAL_URL } = require('../config');

describe('Chat room tests from multiple users', () => {
  let browser = '';
  // Admin will be signed in on page 1 and user will be signed in on page 2
  let page = '';
  let browser2 = '';
  let page2 = '';
  beforeEach(async () => {
    browser = await puppeteer.launch();
    browser2 = await puppeteer.launch();

    page = await browser.newPage();
    page.setViewport({ width: 1366, height: 768 });
  
    // Login before the test case
    await page.goto(`${PORTAL_URL}`);
    await page.type('#loginForm [name="eid"]', 'ahsan');
    await page.type('#loginForm [name="pw"]', '3ratcat3');
    await page.click('#loginForm [name="submit"]');
    await page.waitForSelector('.workspace');
    // Goto the test project site's chat room
    await page.goto(`${PORTAL_URL}/site/bb1f5109-01b4-40d5-988b-d43abbda5381/tool/d20d0127-bde5-4230-a8bf-3a6ddec11ece/room`, {waitFor: 'networkidle0'});

    page2 = await browser2.newPage();
    await page2.setViewport({ width: 1366, height: 768 });
    // Login before the test case
    await page2.goto(`${PORTAL_URL}`);
    await page2.type('#loginForm [name="eid"]', 'ahsan-2');
    await page2.type('#loginForm [name="pw"]', '3ratcat3');
    await page2.click('#loginForm [name="submit"]');
    await page2.waitForSelector('.workspace');
    // Goto the test project site's chat room
    await page2.goto(`${PORTAL_URL}/site/bb1f5109-01b4-40d5-988b-d43abbda5381/tool/d20d0127-bde5-4230-a8bf-3a6ddec11ece/room`, {waitFor: 'networkidle0'});
  });

  it('should list other users in chat room present members', async () => {
    await page.waitFor(4000);
    const usersList1 = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ul#presence li')).map((item)=> item.textContent.trim().toLowerCase());
    });

    const usersList2 = await page2.evaluate(() => {
      return Array.from(document.querySelectorAll('ul#presence li')).map((item)=> item.textContent.trim().toLowerCase());
    });

    // Check presence of alternative users
    expect(usersList1).to.contain('muhammad talal');
    expect(usersList2).to.contain('ahsan naveed');
  });

  it('should show sent message to other user', async () => {
    const randomText1 = 'Test' + Math.random();
    const randomText2 = 'Test' + Math.random();

    // Send randomText1 from Admin and get last message in member page
    await page.type('.panel-footer textarea', randomText1);
  
    await page.click('.panel-footer input[value="Add message"]'),
    
    await page.waitFor(5000);
    const lastMessage1 = await page2.evaluate(() => {
      return document.querySelector('.chatList li:last-of-type .chatText').textContent;
    });

    // Send randomText2 from Member and get last message in admin page
    await page2.type('.panel-footer textarea', randomText2);
  
    await page2.click('.panel-footer input[value="Add message"]'),
    
    await page2.waitFor(5000);
    const lastMessage2 = await page.evaluate(() => {
      return document.querySelector('.chatList li:last-of-type .chatText').textContent;
    });

    // Compare to check that the messages where recieved on both sides
    expect(lastMessage1).to.equal(randomText1);
    expect(lastMessage2).to.equal(randomText2);
  })

  afterEach(async () => {
    await browser.close();
    await browser2.close();
  });
});