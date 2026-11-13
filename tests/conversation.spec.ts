import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('voice-button')).toBeVisible();
});

test('plays the complete voice timeline and resets cleanly', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  // The breathing orb intentionally never becomes geometrically still.
  await page.getByTestId('voice-button').click({ force: true });
  await expect(page.getByTestId('status-label')).toHaveText('I’m listening.');
  await expect(page.getByTestId('transcript')).toContainText('Help me slow down', { timeout: 5000 });
  await expect(page.getByTestId('user-bubble')).toHaveText('Help me slow down for a moment.', { timeout: 7000 });
  await expect(page.getByTestId('status-label')).toHaveText('A little lighter, together.', { timeout: 7000 });
  await expect(page.getByTestId('reply-text')).toContainText('Relax your shoulders.');
  await page.getByTestId('reset-button').click();
  await expect(page.getByTestId('status-label')).toHaveText('A thought starts with a word.');
  await expect(page.getByTestId('user-bubble')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('cancels pending work even after repeated replay', async ({ page }) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByTestId('voice-button').click({ force: true });
    await page.getByTestId('cancel-button').click();
  }
  await page.waitForTimeout(5500);
  await expect(page.getByTestId('status-label')).toHaveText('A thought starts with a word.');
  await expect(page.getByTestId('user-bubble')).toHaveCount(0);
  await expect(page.getByTestId('reply-text')).toHaveCount(0);
});

test('submits text once and blocks duplicate sends while thinking', async ({ page }) => {
  await expect(page.getByTestId('send-button')).toBeDisabled();
  await page.getByTestId('message-input').fill('Help me find my focus');
  await page.getByTestId('send-button').click();
  await expect(page.getByTestId('user-bubble')).toHaveText('Help me find my focus');
  await expect(page.getByTestId('send-button')).toBeDisabled();
  await expect(page.getByTestId('reply-text')).toContainText('Pick one thing that matters today.', { timeout: 7000 });
  await expect(page.getByTestId('user-bubble')).toHaveCount(1);
});

test('suggestions work with reduced motion and the screen fits its viewport', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.getByTestId('suggestion-2').click();
  await expect(page.getByTestId('reply-text')).toContainText('curiosity', { timeout: 7000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await expect(page.getByTestId('message-input')).toBeInViewport();
});
