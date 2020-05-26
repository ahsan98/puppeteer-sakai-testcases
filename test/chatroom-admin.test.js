const puppeteer = require('puppeteer');
const { expect } = require('chai');
const { PORTAL_URL } = require('../config');

describe('Chat room tests from Admin', () => {
  let browser = '';
  let page = '';
  beforeEach(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    page.setViewport({ width: 1366, height: 768});

    // Login before the test case
    await page.goto(`${PORTAL_URL}`);
    await page.type('#loginForm [name="eid"]', 'ahsan');
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

  it('should list me in users in chat room present members', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const usersList = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ul#presence li')).map((item)=> item.textContent.trim().toLowerCase());
    });

    expect(usersList).to.contain('ahsan naveed');
  });

  it('should show actions toolbar for configuration since user is creator', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const optionsShown = await page.evaluate(() => {
      return !!document.querySelector('.navIntraTool.actionToolbar');
    });

    expect(optionsShown).to.be.true;
  });
  
  it('should clear chat message on button click', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    await page.type('.panel-footer textarea', 'This is a test message');
    await page.click('.panel-footer input[value="Clear"]');
    await page.waitFor(100);
    const text = await page.evaluate(() => {
      return document.querySelector('.panel-footer textarea').value;
    });

    expect(text).to.be.empty;
  });

  it('should show sent message at the end of messages', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const randomText = 'Test' + Math.random();
    await page.type('.panel-footer textarea', randomText);
  
    await page.click('.panel-footer input[value="Add message"]'),
    await page.waitFor(1000)

    const lastMessage = await page.evaluate(() => {
      return document.querySelector('.chatList li:last-of-type .chatText').textContent;
    });

    expect(lastMessage).to.equal(randomText);
  });

  it('should remove message on delete', async () => {
    await Promise.all([
      page.click('.icon-sakai--sakai-chat'),
      page.waitForNavigation()
    ]);

    const lastMessage = await page.evaluate(() => {
      return document.querySelector('.chatList li:last-of-type .chatText').textContent;
    });

    const currentMessage = lastMessage + '-new';

    // Append to last to keep it different from last
    await page.type('.panel-footer textarea', currentMessage+'-new');
  
    await page.click('.panel-footer input[value="Add message"]'),
    await page.waitFor(100)

    // Delete the message
    await page.click('.chatList li:not(.hide):last-of-type .chatRemove');
    await page.waitFor(100);
    await page.click('.modal-footer #deleteButton');
    await page.waitFor(100);

    const currentLastMessage = await page.evaluate(() => {
      return document.querySelector('.chatList li:last-of-type .chatText').textContent;
    });

    // Check if last message is not the one we sent since it should be deleted
    expect(currentLastMessage).to.not.equal(currentMessage);
  });

  afterEach(async () => {
    await browser.close();
  });
});