import { expect, test } from '@playwright/test';

test.describe('Tool - Mybatis log converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mybatis-log-converter');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Mybatis log converter - IT Tools');
  });

  test('', async ({ page }) => {

  });
});
