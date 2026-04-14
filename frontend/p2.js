const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log("Navigating...");
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.content();
  console.log("HTML length:", content.length);
  
  if (content.length < 500) {
     console.log(content);
  } else {
     // Check for root div
     const body = await page.evaluate(() => document.body.innerHTML);
     console.log("Body length:", body.length);
     if (body.length < 500) console.log(body);
  }

  await page.screenshot({ path: 'screenshot.png' });
  console.log("Saved screenshot.png");

  await browser.close();
})();
