const puppeteer = require('puppeteer');

async function captureOpenMeteoTable(zipcode) {
const browser = await puppeteer.launch();
const page = await browser.newPage();
    await page.goto('https://scottypres.github.io/'); // Replace with the actual URL of the page with the form

// Input the zipcode into the specified field and submit
    // Enter the zip code
    await page.type('#zipcodeInput', '34142');
    await page.click('#fetchCoordinatesButton'); // Trigger the data fetching

    // Wait for the wind/cloud toggle button and cloud cover table data to load
    await page.waitForSelector('#toggleButton', { visible: true });

    // Click the toggle button to switch to wind data
    await page.click('#toggleButton');
    await page.waitForSelector('#openmeteo-table', { visible: true });

    // After toggle, you might need to wait for the wind data to appear
    // Ensure the correct data is loaded; you might need a specific selector for wind data

    // Now take a screenshot of the openMeteo table showing wind data
    const openMeteoTable = await page.$('#openmeteo-table');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const boundingBox = await openMeteoTable.boundingBox();

    // Take the screenshot, ensuring you're capturing the correct table
    await openMeteoTable.screenshot({
        path: `openmeteo-wind-${zipcode}-${timestamp}.png`,
        clip: {
            x: boundingBox.x,
            y: boundingBox.y,
            width: Math.min(boundingBox.width, page.viewport().width),
            height: boundingBox.height
        }
    });

await browser.close();
console.log('Screenshot saved.');
}

// Run the capture function every 30 minutes with the desired zipcode
const zipcode = '34142';
const interval = 30 * 60 * 1000; // 30 minutes in milliseconds

setInterval(() => {
captureOpenMeteoTable(zipcode);
}, interval);

// Run the first capture immediately
captureOpenMeteoTable(zipcode);