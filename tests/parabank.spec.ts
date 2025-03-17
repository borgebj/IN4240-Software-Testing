import { test, expect, type Page } from '@playwright/test';

test.describe('testing parabank', async () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://parabank.parasoft.com/parabank/contact.htm');
    })

    test('Use Customer Care Page', async({page}) => {
        let name = 'Kenneth Bjorklund';
        let email = 'Kennethmenuboy@gmail.com';
        let phone = '12345678';
        let message = 'I need help with my order';

        // Expected results
        let expectedHead = `Customer Care`;
        let expectedParOne = `Thank you ${name}`;
        let expectedParTwo = `A Customer Care Representative will be contacting you.`;

        // Fills input-fields
        await page.waitForTimeout(1500);
        await page.locator('#name').fill(name);
        await page.waitForTimeout(1500);
        await page.locator('#email').fill(email);
        await page.waitForTimeout(1500);
        await page.locator('#phone').fill(phone);
        await page.waitForTimeout(1500);
        await page.locator('#message').fill(message);
        await page.waitForTimeout(1500);
        await page.locator('.button', { hasText: 'Send to Customer Care' }).click();
        await page.waitForTimeout(1500);

        // Locates and checks results
        const paragraphs = page.locator("#rightPanel p");

        await expect(page.locator('#rightPanel h1')).toContainText(expectedHead);

        await expect(paragraphs.nth(0)).toContainText(expectedParOne);
        await expect(paragraphs.nth(1)).toContainText(expectedParTwo);
    })

})