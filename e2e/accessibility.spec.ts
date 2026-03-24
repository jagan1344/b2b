import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Web Accessibility', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    
    // Give the page a moment to settle
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // In a real project, we might allow some violations initially or fail strictly
    // For this testing demo, we'll assert that there are no critical violations
    const violations = accessibilityScanResults.violations.filter(
      v => ['critical', 'serious'].includes(v.impact || '')
    );
    
    expect(violations).toEqual([]);
  });
});
