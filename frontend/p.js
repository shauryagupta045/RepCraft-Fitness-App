const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`${msg.type().toUpperCase()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        const location = msg.location();
        console.log(`Location: ${location.url}:${location.lineNumber}`);
      }
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
    console.log(err.stack);
  });

  console.log("Navigating to http://localhost:8081...");
  try {
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log("Page loaded. Waiting 2 seconds for JS execution...");
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log("Navigation error:", e.message);
  }

  await browser.close();
})();
