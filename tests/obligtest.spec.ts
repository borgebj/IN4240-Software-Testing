import { test, expect, type Page } from '@playwright/test';


// Registers account for temporary usage, usually done before tests (Due to how parabank testing website is made)
async function register(page: Page, all: string) {
    await page.locator('#loginPanel').locator('a:has-text("Register")').click();

    const fields = [
        'customer.firstName',
        'customer.lastName',
        'customer.address.street',
        'customer.address.city',
        'customer.address.state',
        'customer.address.zipCode',
        'customer.phoneNumber',
        'customer.ssn',
        'customer.username',
        'customer.password',
        'repeatedPassword'
    ];

    // Enters values
    for (const field of fields) {
        await page.locator(`.input[name='${field}']`).fill(all);
    }

    // Register
    await page.locator(".button[value='Register']").click();

    // Check for error after registering
    const error = page.locator('.error');

    try {
        await error.waitFor({ state: 'attached', timeout: 2000 });

        // If error, stop test
        if (await error.isVisible()) {
            return;
        }
    } catch (e) { 
        // No error, finish registration
    }

    // Log out
    await page.locator('#leftPanel').locator('a:has-text("Log Out")').click();
}


// Logs inn by finding login elements and entering info
async function login(page: Page, name: string, pswd: string) {
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await page.locator('input[name="username"].input').fill(name);
    await page.locator('input[name="password"].input').fill(pswd);
    await page.locator('.button', { hasText: 'Log In' }).click();
}

// for logging out
async function logout(page: Page) {
    await page.locator('#leftPanel').locator('a', { hasText: "Log Out" }).click();
}



test.describe('Testing Parabank', () => {

    // User info
    let name = 'ken';
    let passwd = 'ken';


    // NB!   Registering MUST be done due to how the website works !
    // (cant be done in the beforeAll function, as it may sometime be reset)
    test.beforeEach(async ({ page }) => {
        await page.goto('https://parabank.parasoft.com/parabank/index.htm');

        await register(page, name);
        await login(page, name, passwd);
    });


    // test 1
    test('Verify login feature', async ({ page }) => {
        // Log out first to ensure the test starts from a logged-out state
        await logout(page);
    
        // Perform login
        await login(page, name, passwd);
    
        // Verify login was successful
    
        // Check the sidebar title
        const sideTitle = page.locator('#leftPanel h2:has-text("Account Services")');
        await expect(sideTitle).toBeVisible();
    
        // Check for the first sidebar element
        const sideElement = page.locator('#leftPanel ul li a:has-text("Open New Account")');
        await expect(sideElement).toBeVisible();
    });



    // test 2
    test('Verify admin privileges', async ({ page }) => {
        
        // Click last item in left menu (Admin section)
        await page.locator('.leftmenu li:last-child').click();
    
        // Press the "CLEAN" button under the database section
        await page.locator('.button:has-text("Clean")').click();
    
        const adminHeader = page.locator('#rightPanel h1');
        const adminText = page.locator('#rightPanel p');
    
        // Checks if we are in the correct section
        await expect(adminHeader).toContainText("Administration");
    
        // Ensure database is cleaned
        const text = await adminText.textContent();
        if (text) {
            expect(text.trim()).toContain("Database Cleaned");
        }
    });    



    // test 3
    test('Verify platform navigation', async({ page }) => {

        // 1. Navigate to the front page. Can be done by clicking on the PARA BANK banner at the top.
        await page.locator('.logo').click()

        // 2. Press the middle orange button on the upper right side of the page.
        await page.locator('.aboutus').click()

        // check if on correct page
        await expect(page).toHaveURL('https://parabank.parasoft.com/parabank/about.htm');
        await expect(page.locator(".title")).toContainText("ParaSoft Demo Website");
    });



    // log out
    test.afterEach(async ({ page }) => {
        await logout(page);
    })
});
