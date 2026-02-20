import { test, expect } from '@playwright/test';

test.describe('Remotion Player', () => {
    test('should load the player and show the title', async ({ page }) => {
        // Start dev server should be running or we use a build
        // For now, assume dev server is at http://localhost:5173
        await page.goto('http://localhost:5173');

        // Check for sidebar title
        await expect(page.locator('h1')).toContainText('Remotion Player');

        // Check if the player component is rendered
        // The player has a data-remotion-player attribute or similar
        // We can also check for the canvas/video element
        const player = page.locator('.remotion-player-container'); // This might depend on how it's styled
        await expect(player).toBeVisible();
    });

    test('should switch between sections', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Click on a section link
        await page.click('text=01: Defining AP');

        // The duration or title might update
        // For now, just check if it doesn't crash
        await expect(page.locator('body')).not.toContainText('Error');
    });
});
