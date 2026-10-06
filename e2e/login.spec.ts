import { expect, test } from '@playwright/test';

test('demo user signs in and sees live station data', async ({ page }) => {
  await page.goto('/');

  // Unauthenticated visitors are redirected to the login page.
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button', { name: 'Administrátor' }).click();
  await page.getByRole('button', { name: 'Přihlásit se' }).click();

  await expect(page.getByRole('heading', { name: 'Přehled sítě' })).toBeVisible();
  await expect(page.getByTestId('live-indicator')).toHaveText('LIVE');
  await expect(page.getByTestId('station-card').first()).toBeVisible();
});
