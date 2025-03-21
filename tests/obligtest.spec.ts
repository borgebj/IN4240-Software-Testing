import { test, expect, type Page } from '@playwright/test';

test.describe('testing parabank', async () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://parabank.parasoft.com/parabank/index.htm');

        let name = 'ken';
        let password = 'ken';

        await page.waitForTimeout(1000);
        await page.locator('input[name="username"].input').fill(name);
        await page.waitForTimeout(1000);
        await page.locator('input[name="password"].input').fill(password);
        await page.waitForTimeout(1000);
        await page.locator('.button', { hasText: 'Log In' }).click();
        await page.waitForTimeout(1000);

    })

    test('Verify admin privileges', async({page}) => {

        await page.waitForTimeout(1000);
        await page.locator('.leftmenu li:last-child').click();
        await page.waitForTimeout(1000);

        // await expect(page.locator('#resultDiv'))
        //     .toContainText(`The factorial of ${input} is: ${expectedAnswer}`);
    })
})