const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('CON:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.toString()));

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', e => console.log('U_ERR:', e.message));
    window.addEventListener('unhandledrejection', e => console.log('U_REJ:', e.reason));
  });

  await page.goto('http://localhost:8081', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
