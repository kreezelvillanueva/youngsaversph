import { test, expect, type Page } from '@playwright/test';

test.describe('5. Products dropdown (keyboard)', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop nav only');

  test('opens with keyboard, Escape closes and refocuses summary, Tab past last link closes', async ({ page }) => {
    await page.goto('/');
    const details = page.locator('details.nav-products');
    const summary = details.locator('> summary');
    await expect(summary).toHaveText('Products');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await expect(details).not.toHaveAttribute('open');
    await expect(summary).toBeFocused();

    await page.keyboard.press('Space');
    await expect(details).toHaveAttribute('open', '');
    const links = details.locator('a');
    const n = await links.count();
    for (let i = 0; i < n; i++) await page.keyboard.press('Tab');
    await expect(links.last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(details).not.toHaveAttribute('open');
  });
});

test.describe('6. Contact form (Web3Forms stubbed)', () => {
  const submit = async (page: Page) => {
    await page.locator('#cf-name').fill('QA Test');
    await page.locator('#cf-email').fill('qa@example.com');
    await page.locator('#cf-message').fill('Automated test, stubbed.');
    await page.getByRole('button', { name: 'Send message' }).click();
  };

  test.beforeEach(async ({ page }) => {
    // Safety net: nothing may reach the real endpoint. Later routes take precedence.
    await page.route('https://api.web3forms.com/**', (r) => r.abort());
  });

  test('honeypot botcheck is present and hidden', async ({ page }) => {
    await page.goto('/contact/');
    const hp = page.getByTestId('contact-form').locator('input[name=botcheck]');
    await expect(hp).toHaveCount(1);
    await expect(hp).toBeHidden();
  });

  test('success message appears in form-status', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (r) => r.fulfill({ json: { success: true } }));
    await page.goto('/contact/');
    await submit(page);
    await expect(page.getByTestId('form-status')).toContainText(/thank you/i);
  });

  test('failure message appears in form-status', async ({ page }) => {
    await page.route('https://api.web3forms.com/submit', (r) => r.fulfill({ status: 400, json: { success: false } }));
    await page.goto('/contact/');
    await submit(page);
    await expect(page.getByTestId('form-status')).toContainText(/failed/i);
  });
});
