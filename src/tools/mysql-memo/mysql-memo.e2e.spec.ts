import { test, expect } from '@playwright/test';

test.describe('Tool - Mysql memo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mysql-memo');
  });

  test('Has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Mysql memo - IT Tools');
  });

  test('', async ({ page }) => {

  });
});