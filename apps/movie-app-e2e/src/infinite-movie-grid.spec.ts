import { test, expect } from '@playwright/test';

/**
 * E2E tests for the InfiniteMovieGrid component.
 *
 * The grid is rendered on the /en/movies page. It displays popular movies by
 * default and search results when a query param `?q=` is present. It uses
 * virtualisation (@tanstack/react-virtual) so only visible rows are rendered
 * in the DOM at any time.
 */
test.describe('InfiniteMovieGrid', () => {
  // Run tests sequentially to avoid crashing the dev server with too many tabs
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Navigate to the movies page and wait for initial data to load
    await page.goto('/en/movies');
    // Wait until at least one movie card link is visible
    await page.locator('[data-index] a').first().waitFor({ state: 'visible', timeout: 15000 });
  });

  // ─── Rendering ──────────────────────────────────────────────────────

  test('renders the initial movie grid with cards', async ({ page }) => {
    // Movie grid should contain virtualised row containers
    const rows = page.locator('[data-index]');
    await expect(rows.first()).toBeVisible();

    // Each row should contain at least one movie card (link to /movies/:id)
    const movieLinks = page.locator('[data-index] a[href*="/movies/"]');
    expect(await movieLinks.count()).toBeGreaterThanOrEqual(2);
  });

  test('displays movie titles', async ({ page }) => {
    // The title links are the second link in each card with class font-semibold
    const titleLink = page.locator('[data-index] a.font-semibold').first();
    await expect(titleLink).toBeVisible();
    const text = await titleLink.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('displays movie ratings', async ({ page }) => {
    // Ratings appear as a small badge next to the star icon – represented by
    // a <span> containing a number like "7.2" inside the rating badge
    const ratingBadge = page.locator('[data-index] .text-yellow-500').first();
    await expect(ratingBadge).toBeVisible();
  });

  // ─── Responsive grid ────────────────────────────────────────────────

  test('shows 2 columns on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // Give the grid time to re-calculate columns
    await page.waitForTimeout(500);

    const firstRow = page.locator('[data-index="0"]');
    await expect(firstRow).toBeVisible();

    // grid-cols-2 at mobile: each row should contain 2 movie card containers
    const cardsInFirstRow = firstRow.locator('> div.block.group');
    const count = await cardsInFirstRow.count();
    expect(count).toBeLessThanOrEqual(2);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('shows more columns on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);

    const firstRow = page.locator('[data-index="0"]');
    await expect(firstRow).toBeVisible();

    // At xl breakpoint (1440px) the grid should show up to 5 columns
    const cardsInFirstRow = firstRow.locator('> div.block.group');
    expect(await cardsInFirstRow.count()).toBeGreaterThanOrEqual(4);
  });

  // ─── Virtualisation ────────────────────────────────────────────────

  test('virtualises the grid (does not render all rows at once)', async ({ page }) => {
    // The virtual container should have a height set via inline style
    // It's the parent of the [data-index] rows
    const virtualContainer = page.locator('[data-index="0"]').locator('..');
    await expect(virtualContainer).toHaveAttribute('style', /height/);

    // Rendered rows should be fewer than the total movies / columns
    const renderedRows = page.locator('[data-index]');
    const rowCount = await renderedRows.count();
    // With virtualisation + overscan, far fewer rows are mounted than total
    expect(rowCount).toBeLessThan(20);
  });

  // ─── Infinite scroll ───────────────────────────────────────────────

  test('loads more movies when scrolling to the bottom', async ({ page }) => {
    // Count initial movie links
    const initialCount = await page.locator('[data-index] a[href*="/movies/"]').count();

    // Scroll down aggressively to trigger fetchNextPage
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(500);
    }

    // Wait for new content: the movie link count should grow
    await expect(async () => {
      const newCount = await page.locator('[data-index] a[href*="/movies/"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }).toPass({ timeout: 15000 });
  });

  // ─── Navigation ─────────────────────────────────────────────────────

  test('movie cards link to the correct detail page', async ({ page }) => {
    const firstLink = page.locator('[data-index] a[href*="/movies/"]').first();
    const href = await firstLink.getAttribute('href');

    // The href should look like /en/movies/{id}
    expect(href).toMatch(/\/en\/movies\/\d+/);
  });

  test('clicking a movie card navigates to its detail page', async ({ page }) => {
    const firstLink = page.locator('[data-index] a[href*="/movies/"]').first();
    const href = (await firstLink.getAttribute('href'))!;
    await firstLink.click();

    await page.waitForURL(`**${href}`, { timeout: 15000 });
    expect(page.url()).toContain(href);
  });

  // ─── Search ─────────────────────────────────────────────────────────

  test('filters movies when using the search input', async ({ page }) => {
    // There are two search inputs (mobile + desktop). Pick the visible one.
    const searchInput = page.getByPlaceholder('Search movies...').first();
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('Matrix');

    // Wait for the url to contain the query param (debounced)
    await expect(async () => {
      const url = page.url();
      expect(url).toContain('q=Matrix');
    }).toPass({ timeout: 5000 });

    // Wait for search results to load
    await page.waitForTimeout(1000);

    // The results should contain movie cards
    const movieLinks = page.locator('[data-index] a[href*="/movies/"]');
    await expect(movieLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test('shows empty state for a search with no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search movies...').first();
    await searchInput.fill('xyznonexistentmovie12345');

    // Wait for the grid to show the empty state message
    await expect(page.getByText('No results found')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Try different keywords')).toBeVisible();
  });

  test('clearing search returns to popular movies', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search movies...').first();

    // Search for something
    await searchInput.fill('Matrix');
    await expect(async () => {
      expect(page.url()).toContain('q=Matrix');
    }).toPass({ timeout: 5000 });

    // Clear the search using the clear button
    const clearButton = page.locator('button[aria-label="Clear search"]').first();
    await clearButton.click();

    // URL should no longer contain the query
    await expect(async () => {
      expect(page.url()).not.toContain('q=');
    }).toPass({ timeout: 5000 });

    // Popular movies should be displayed again
    const movieLinks = page.locator('[data-index] a[href*="/movies/"]');
    await expect(movieLinks.first()).toBeVisible({ timeout: 10000 });
  });
});
