import { chromium } from 'playwright-core';
import { Browserbase } from '@browserbasehq/sdk';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Service for handling custom instructions operations using Browserbase SDK
 */
class InstructionsService {
  constructor() {
    this.browserbaseApiKey = process.env.BROWSERBASE_API_KEY;
    this.browserbaseProjectId = process.env.BROWSERBASE_PROJECT_ID;
    this.loginUrl = 'https://gozblox.ada.support/customization/persona/custom-instructions';
    this.defaultUsername = process.env.AUTH_USERNAME;
    this.defaultPassword = process.env.AUTH_PASSWORD;
    this.browserbase = null;
  }

  /**
   * Get or initialize the Browserbase client
   * @returns {Browserbase} The Browserbase client
   */
  getClient() {
    if (!this.browserbase) {
      if (!this.browserbaseApiKey) {
        throw new Error('BROWSERBASE_API_KEY environment variable is not set');
      }
      
      // Initialize the Browserbase client
      this.browserbase = new Browserbase({
        apiKey: this.browserbaseApiKey,
      });
    }
    return this.browserbase;
  }

  /**
   * Get all custom instructions
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   * @returns {Promise<Array>} - List of instructions
   */
  async getInstructions(username, password) {
    let browser = null;
    let page = null;
    let session = null;
    
    try {
      console.log('Connecting to Browserbase...');
      
      const browserbase = this.getClient();
      
      // Create a new session
      session = await browserbase.createSession({
        projectId: this.browserbaseProjectId,
      });
      
      // Connect to the session using Playwright
      browser = await chromium.connectOverCDP(session.connectUrl);
      
      // Get the default context and page
      const context = browser.contexts()[0];
      page = context.pages()[0];
      
      console.log(`Navigating to ${this.loginUrl}...`);
      await page.goto(this.loginUrl);
      
      // Login
      await this._login(page, username, password);
      
      // Wait for table rows to be visible
      await page.waitForSelector('tbody tr', { timeout: 10000 }).catch(() => {
        console.log('No instructions found or table not loaded');
        return [];
      });

      console.log(`Got the table`);
      
      // Extract instructions
      const instructions = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        if (rows.length === 0) return [];
        console.log(`Found some rows...`);
        return rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return {
            title: cells[0]?.textContent?.trim() || '',
            status: cells[1]?.textContent?.trim() || '',
            lastModified: cells[2]?.textContent?.trim() || ''
          };
        });
      });
      
      return instructions;
    } catch (error) {
      console.error('Error getting instructions:', error);
      throw error;
    } finally {
      // Close the page and browser
      if (page) {
        await page.close().catch(e => console.error('Error closing page:', e));
      }
      if (browser) {
        await browser.close().catch(e => console.error('Error closing browser:', e));
      }
      console.log(`Session complete! View replay at https://browserbase.com/sessions/${session?.id}`);
    }
  }
  
  /**
   * Create a new custom instruction
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   * @param {string} title - The title of the instruction
   * @param {string} instruction - The instruction content
   * @returns {Promise<object>} - Result of the operation
   */
  async createInstruction(username, password, title, instruction) {
    let browser = null;
    let page = null;
    let session = null;
    
    try {
      console.log('Connecting to Browserbase...');
      
      const browserbase = this.getClient();
      
      // Create a new session
      session = await browserbase.createSession({
        projectId: this.browserbaseProjectId,
      });
      
      // Connect to the session using Playwright
      browser = await chromium.connectOverCDP(session.connectUrl);
      
      // Get the default context and page
      const context = browser.contexts()[0];
      page = context.pages()[0];
      
      // Navigate directly to the create instruction page
      const createUrl = 'https://gozblox.ada.support/guidance/create';
      console.log(`Navigating to ${createUrl}...`);
      await page.goto(createUrl);
      
      // Login
      await this._login(page, username, password);
      
      console.log('Creating new instruction...');
      
      // Fill in the title field
      await page.locator('textarea').first().fill(title);
      
      // Fill in the instruction field
      await page.locator('textarea').nth(1).fill(instruction);
      
      // Click the Save and make active button
      await page.click('button:has-text("Save and make active")');
      
      // Wait for the operation to complete
      await page.waitForTimeout(1000);
      
      return {
        success: true,
        message: `Instruction "${title}" created successfully`,
        sessionId: session.id,
        sessionUrl: `https://browserbase.com/sessions/${session.id}`
      };
    } catch (error) {
      console.error('Error creating instruction:', error);
      throw error;
    } finally {
      // Close the page and browser
      if (page) {
        await page.close().catch(e => console.error('Error closing page:', e));
      }
      if (browser) {
        await browser.close().catch(e => console.error('Error closing browser:', e));
      }
      console.log(`Session complete! View replay at https://browserbase.com/sessions/${session?.id}`);
    }
  }
  
  /**
   * Delete all custom instructions
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   * @returns {Promise<object>} - Result of the operation
   */
  async deleteAllInstructions(username, password) {
    let browser = null;
    let page = null;
    let session = null;
    
    try {
      console.log('Connecting to Browserbase...');
      
      const browserbase = this.getClient();
      
      // Create a new session
      session = await browserbase.createSession({
        projectId: this.browserbaseProjectId,
      });
      
      // Connect to the session using Playwright
      browser = await chromium.connectOverCDP(session.connectUrl);
      
      // Get the default context and page
      const context = browser.contexts()[0];
      page = context.pages()[0];
      
      console.log(`Navigating to ${this.loginUrl}...`);
      await page.goto(this.loginUrl);
      
      // Login
      await this._login(page, username, password);
      
      // Wait for table rows to be visible
      await page.waitForSelector('tbody tr', { timeout: 5000 }).catch(() => {
        console.log('No instructions found or table not loaded');
        return {
          success: true,
          message: 'No instructions to delete',
          sessionId: session.id,
          sessionUrl: `https://browserbase.com/sessions/${session.id}`
        };
      });
      
      // Delete all rows
      let hasMoreRows = true;
      let deletedCount = 0;
      
      while (hasMoreRows) {
        // Check if there are any rows left
        const rowCount = await page.evaluate(() => {
          return document.querySelectorAll('tbody tr').length;
        });
        
        if (rowCount === 0) {
          hasMoreRows = false;
          break;
        }
        
        console.log(`Found ${rowCount} instructions to delete`);
        
        // Click the last cell (more options menu) of the first row
        await page.click('tbody tr:first-child td:last-child button');
        
        // Wait for and click the delete button in popover
        await page.click('button:has-text("Delete")');
        
        // Wait for and click the confirm delete button in modal
        await page.click('button:has-text("Delete")');
        
        // Wait for deletion to complete
        await page.waitForTimeout(500);
        
        deletedCount++;
      }
      
      return {
        success: true,
        message: `All instructions deleted successfully (${deletedCount} total)`,
        sessionId: session.id,
        sessionUrl: `https://browserbase.com/sessions/${session.id}`
      };
    } catch (error) {
      console.error('Error deleting instructions:', error);
      throw error;
    } finally {
      // Close the page and browser
      if (page) {
        await page.close().catch(e => console.error('Error closing page:', e));
      }
      if (browser) {
        await browser.close().catch(e => console.error('Error closing browser:', e));
      }
      console.log(`Session complete! View replay at https://browserbase.com/sessions/${session?.id}`);
    }
  }
  
  /**
   * Delete a specific instruction by title
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   * @param {string} title - The title of the instruction to delete
   * @returns {Promise<object>} - Result of the operation
   */
  async deleteInstruction(username, password, title) {
    let browser = null;
    let page = null;
    let session = null;
    
    try {
      console.log('Connecting to Browserbase...');
      
      const browserbase = this.getClient();
      
      // Create a new session
      session = await browserbase.createSession({
        projectId: this.browserbaseProjectId,
      });
      
      // Connect to the session using Playwright
      browser = await chromium.connectOverCDP(session.connectUrl);
      
      // Get the default context and page
      const context = browser.contexts()[0];
      page = context.pages()[0];
      
      console.log(`Navigating to ${this.loginUrl}...`);
      await page.goto(this.loginUrl);
      
      // Login
      await this._login(page, username, password);
      
      // Wait for table rows to be visible
      await page.waitForSelector('tbody tr', { timeout: 5000 }).catch(() => {
        console.log('No instructions found or table not loaded');
        return {
          success: false,
          message: `No instructions found to delete`,
          sessionId: session.id,
          sessionUrl: `https://browserbase.com/sessions/${session.id}`
        };
      });
      
      // Find the row with the matching title
      const rowExists = await page.evaluate((searchTitle) => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const targetRow = rows.find(row => {
          const titleCell = row.querySelector('td:first-child');
          return titleCell && titleCell.textContent.trim() === searchTitle;
        });
        return !!targetRow;
      }, title);
      
      if (!rowExists) {
        return {
          success: false,
          message: `Instruction "${title}" not found`,
          sessionId: session.id,
          sessionUrl: `https://browserbase.com/sessions/${session.id}`
        };
      }
      
      // Click the options button for the row with the matching title
      await page.evaluate((searchTitle) => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const targetRow = rows.find(row => {
          const titleCell = row.querySelector('td:first-child');
          return titleCell && titleCell.textContent.trim() === searchTitle;
        });
        if (targetRow) {
          const optionsButton = targetRow.querySelector('td:last-child button');
          if (optionsButton) optionsButton.click();
        }
      }, title);
      
      // Wait for and click the delete button in popover
      await page.click('button:has-text("Delete")');
      
      // Wait for and click the confirm delete button in modal
      await page.click('button:has-text("Delete")');
      
      // Wait for deletion to complete
      await page.waitForTimeout(500);
      
      return {
        success: true,
        message: `Instruction "${title}" deleted successfully`,
        sessionId: session.id,
        sessionUrl: `https://browserbase.com/sessions/${session.id}`
      };
    } catch (error) {
      console.error('Error deleting instruction:', error);
      throw error;
    } finally {
      // Close the page and browser
      if (page) {
        await page.close().catch(e => console.error('Error closing page:', e));
      }
      if (browser) {
        await browser.close().catch(e => console.error('Error closing browser:', e));
      }
      console.log(`Session complete! View replay at https://browserbase.com/sessions/${session?.id}`);
    }
  }
  
  /**
   * Helper method to handle login
   * @private
   * @param {Object} page - Playwright page object
   * @param {string} username - The username for login
   * @param {string} password - The password for login
   */
  async _login(page, username, password) {
    console.log('Logging in...');
    
    // Fill in the email input field
    await page.fill('input[type="email"]', username);
    
    // Fill in the password input field 
    await page.fill('input[type="password"]', password);
    
    // Click the login button
    await page.click('button:has-text("Log in")');
    
    console.log('Login successful');
  }
}

const instructionsService = new InstructionsService();
export default instructionsService;
