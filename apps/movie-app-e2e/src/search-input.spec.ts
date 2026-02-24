import { test, expect } from '@playwright/test';

test.describe('SearchInput Component', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Navigate to the home page where the search bar is present in the NavBar
    await page.goto('/en');
  });

  test('debounces input and navigates to search results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search movies...').first();
    await expect(searchInput).toBeVisible();

    // Type a query
    await searchInput.fill('Inception');

    // It should navigate to the /movies page with the query param
    await expect(async () => {
      expect(page.url()).toContain('/en/movies?q=Inception');
    }).toPass({ timeout: 5000 });

    // The search input should retain the value
    await expect(searchInput).toHaveValue('Inception');
  });

  test('clears the search input and url', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search movies...').first();
    await searchInput.fill('Avatar');

    // Wait for navigation
    await expect(async () => {
      expect(page.url()).toContain('/en/movies?q=Avatar');
    }).toPass({ timeout: 5000 });

    // Click the clear button
    const clearButton = page.locator('button[aria-label="Clear search"]').first();
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // The input should be empty
    await expect(searchInput).toHaveValue('');

    // The URL should no longer contain the query param, but stay on the /movies page
    await expect(async () => {
      const url = page.url();
      expect(url).not.toContain('q=');
      expect(url).toContain('/en/movies');
    }).toPass({ timeout: 5000 });
  });

  test('syncs with url query parameters on direct load', async ({ page }) => {
    // Navigate directly to a search URL
    await page.goto('/en/movies?q=Interstellar');

    const searchInput = page.getByPlaceholder('Search movies...').first();
    await expect(searchInput).toBeVisible();

    // The input should automatically populate with the URL query
    await expect(searchInput).toHaveValue('Interstellar');
  });
});
