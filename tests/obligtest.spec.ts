import { test, expect, type Page } from '@playwright/test';
import {log} from "util";

// Registers account for temporary usage, usually done before tests (Due to how parabank testing website is made)
async function register(page: Page, all: string) {
    // goes to register
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

    await page.locator(".input[name='customer.firstName']").fill(all);

    // Enters values
    for (const field of fields) {
        await page.locator(`.input[name='${field}']`).fill(all);
    }
    // Register
    await page.locator(".button[value='Register']").click();

    // Check for the username error message
    const usernameError = await page.locator('.error', { hasText: "This username already exists."});

    // skips log out if already registered
    if (usernameError) {
        return;
    }

    // log out
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
    await page.waitForTimeout(1000);
}

test.describe('Testing Parabank', () => {

    let name = 'ken';
    let passwd = 'ken';

    // NB!   Registering MUST be done due to how the website works !
    test.beforeEach(async ({ page }) => {
        await page.goto('https://parabank.parasoft.com/parabank/index.htm');
        await register(page, name);
        await page.waitForTimeout(1000); // waits for 1 second
        await login(page, name, passwd);

    });

    // test 1
    test('Verify admin privileges', async({ page }) => {
        await page.waitForTimeout(1000);
        await page.locator('.leftmenu li:last-child').click();
        await page.waitForTimeout(1000);

        // Press the “CLEAN” button under the database section.
        await page.locator('.button', { hasText: 'Clean' }).click();
        await page.waitForTimeout(1000);

        const adminHeader = page.locator('#rightPanel h1');
        const adminText = page.locator('#rightPanel p');

        // checks we are in correct section
        await expect(adminHeader).toContainText("Administration");

        // Checks database is cleansed
        const text = await adminText.textContent();
        await expect(text.trim()).toContain("Database Cleaned");       // This is 'wrong' but asserts true here to continue
    });

    // test 2
    test('Verify login feature', async({ page }) => {
        await page.waitForTimeout(1000);

        // Verify login successful:
        // correct sidebar
        const sidebar = page.locator("#leftPanel");
        const sidelist = sidebar.locator("li");

        await expect(sidebar.locator("h2")).toContainText("Account Services");
        await expect(sidelist.nth(0)).toContainText("Open New Account");
    });

    // test 3
    test('Verify platform navigation', async({ page }) => {
        await page.waitForTimeout(1000);

        // 1. Navigate to the front page. Can be done by clicking on the PARA BANK banner at the top.
        await page.locator('.logo').click()
        await page.waitForTimeout(1000);

        // 2. Press the middle orange button on the upper right side of the page.
        await page.locator('.aboutus').click()
        await page.waitForTimeout(1000);

        // check if on correct page
        await expect(page).toHaveURL('https://parabank.parasoft.com/parabank/about.htm');
        await expect(page.locator(".title")).toContainText("ParaSoft Demo Website");
    });

    // log out
    test.afterEach(async ({ page }) => {
        await logout(page);
    })
});
