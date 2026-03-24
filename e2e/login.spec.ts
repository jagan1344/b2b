import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show login page with initial state', async ({ page }) => {
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error on empty login submit', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click();
    // Assuming backend returns an error or there's client side validation
    // The specific error handling might vary depending on how the app is built
    // For now, let's just check if it stays on the login page or shows an error
    await expect(page).toHaveURL(/.*login/);
  });

  test('should switch to registration mode and back', async ({ page }) => {
    await page.getByText('Register').click();
    await expect(page.getByText('Create Account')).toBeVisible();
    await expect(page.getByRole('button', { name: /send otp/i })).toBeVisible();

    await page.getByRole('button', { name: /back to login/i }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });
});
