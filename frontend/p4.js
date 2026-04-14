const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CON:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.toString()));
  page.on('requestfailed', request => console.log('REQ_FAIL:', request.url(), request.failure().errorText));
  page.on('response', response => {
    if(!response.ok()) console.log('HTTP_ERR:', response.status(), response.url());
  });

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', e => console.log('U_ERR:', e.message));
  });

  console.log("Loading page...");
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0', timeout: 30000 });
  console.log("Page loaded. Body:", await page.evaluate(() => document.body.innerHTML.slice(0, 200)));
  await browser.close();
})();
