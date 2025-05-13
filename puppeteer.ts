console.info("Launching browser...");

/* To make things easier, we've setup Playwright using the window variables.
 You can access it and your API key using window.playwright or window.connectionString. */
const browser = await window.playwright.chromium.connectOverCDP(window.connectionString);
console.info('Connected!');

// For demo purposes, we'll wait a second so we can watch.
await new Promise((resolve) => setTimeout(resolve, 1000));

// Get the default browser context and page instances to interact with the page
const context = browser.contexts()[0];
const page = context.pages()[0];

// Create some todos
const username = 'mike.gozzo@ada.support'
const password = 'Cucuzza1983!'

// Visit TODO MVC
await page.goto('https://gozblox.ada.support/customization/persona/custom-instructions');


// Prompt: enter the value of username into the email field and password into the password field (it has id="Login__password")
// Fill in the email input field
await page.fill('input[type="email"]', username);

// Fill in the password input field 
await page.fill('input[type="password"]', password);


// Prompt: Click the login button
// Wait for and click the login button
await page.locator('button:has-text("Log in")').first().click();


// Prompt: For every row in the table, click the last cell, then click delete in the popover. When the modal appears, click delete on the modal
// Wait for table rows to be visible
await page.waitForSelector('tbody tr');

// Get all table rows
let rows = await page.locator('tbody tr').all();

// Iterate through each row
for (let row of rows) {
    // Click the last cell (more options menu)
    await row.locator('td:last-child button').first().click();
    
    // Wait for and click the delete button in popover
    await page.locator('button:has-text("Delete")').first().click();
    
    // Wait for and click the confirm delete button in modal
    await page.locator('button:has-text("Delete")').first().click();
    
    // Wait for deletion to complete
    await page.waitForTimeout(500);
}


// Prompt: Click new custom instruction
// Click the "New custom instruction" button
await page.locator('button:has-text("New custom instruction")').first().click();


// Prompt: Set the title to "My Title" and the instruction to "Always talk like a pirate", then click "Save and make active"
// Fill in the title field
await page.locator('textarea').first().fill('My Title');

// Fill in the instruction field
await page.locator('textarea').nth(1).fill('Always talk like a pirate');

// Click the Save and make active button
await page.locator('button:has-text("Save and make active")').click();
