import { expect, test } from '@playwright/test';

const storageKey = 'murmur.chat.v2';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('message-input')).toBeEditable();
});

test('keeps every exchange after reload and scrolls to new replies', async ({
  page,
}) => {
  for (const text of [
    'Help me focus today',
    'I have a busy afternoon',
    'A fresh perspective',
  ]) {
    await page.getByTestId('message-input').fill(text);
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('reply-text').last()).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible({
      timeout: 5000,
    });
  }
  await expect(page.getByTestId('user-bubble')).toHaveCount(3);
  await expect(page.getByTestId('assistant-bubble')).toHaveCount(3);
  await expect(page.getByTestId('reply-text').last()).toBeInViewport();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || '{}').messages?.length,
        storageKey,
      ),
    )
    .toBe(6);
  await page.reload();
  await expect(page.getByTestId('user-bubble')).toHaveCount(3);
  await expect(page.getByTestId('assistant-bubble')).toHaveCount(3);
  await expect(page.getByTestId('reply-text').last()).toBeInViewport();
});

test('keeps the composer above a resized visual viewport with a clear focus ring', async ({
  page,
}) => {
  const input = page.getByTestId('message-input');
  await input.fill('Test the keyboard');
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, 'height', {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window.visualViewport, 'offsetTop', {
      configurable: true,
      value: 25,
    });
    window.visualViewport?.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByTestId('composer')).toHaveCSS(
    'border-top-color',
    'rgb(49, 91, 238)',
  );
  await expect(input).toHaveCSS('font-size', '16px');
  await expect(input).toHaveCSS('outline-style', 'none');
  await expect
    .poll(async () => {
      const box = await page.getByTestId('composer').boundingBox();
      return box ? box.y + box.height <= 415 : false;
    })
    .toBe(true);
  await page.getByTestId('send-button').click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId('reply-text').last()).toBeInViewport({
    timeout: 6000,
  });
  await page.evaluate(() => {
    delete (window.visualViewport as unknown as Record<string, unknown>).height;
    delete (window.visualViewport as unknown as Record<string, unknown>)
      .offsetTop;
    window.visualViewport?.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByTestId('message-input')).toBeInViewport();
});

test('cancels voice without a delayed message and can clear saved history', async ({
  page,
}) => {
  await page.getByTestId('suggestion-0').click();
  await expect(page.getByTestId('send-button')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('voice-button').click();
  await expect(page.getByTestId('transcript')).toBeVisible();
  await page.getByTestId('cancel-button').click();
  await page.waitForTimeout(3600);
  await expect(page.getByTestId('user-bubble')).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByTestId('reset-button').click();
  await expect(page.getByTestId('user-bubble')).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || '{}').messages?.length,
        storageKey,
      ),
    )
    .toBe(0);
  await page.reload();
  await expect(page.getByTestId('suggestion-0')).toBeVisible();
});

test('restores a long history and preserves reading position when a reply arrives', async ({
  page,
}) => {
  await page.evaluate((key) => {
    const messages = Array.from({ length: 40 }, (_, index) => ({
      id: String(index),
      role: index % 2 ? 'assistant' : 'user',
      text:
        'Saved message ' +
        index +
        '. A longer message that wraps onto multiple lines in a small mobile viewport.',
      createdAt: 1700000000000 + index,
    }));
    localStorage.setItem(key, JSON.stringify({ version: 1, messages }));
  }, storageKey);
  await page.reload();
  await expect(page.getByTestId('reply-text').last()).toBeInViewport();
  await page.getByTestId('message-input').fill('One more question');
  await page.getByTestId('send-button').click();
  await page.waitForTimeout(300);
  await page.getByTestId('message-list').evaluate((element) => {
    element.scrollTo({ top: 0, behavior: 'instant' });
    element.dispatchEvent(new Event('scroll'));
  });
  await expect(page.getByTestId('latest-button')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || '{}').messages?.length,
        storageKey,
      ),
    )
    .toBe(42);
  await expect(page.getByTestId('latest-button')).toBeVisible();
  await page.getByTestId('latest-button').click();
  await expect(page.getByTestId('reply-text').last()).toBeInViewport();
});

test('handles unavailable storage and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    };
  });
  await page.reload();
  await expect(
    page.getByText('History couldn’t be saved.', { exact: false }),
  ).toBeVisible();
  await page.getByTestId('suggestion-2').click();
  await expect(page.getByTestId('reply-text')).toContainText('friend', {
    timeout: 5000,
  });
  await expect(page.getByTestId('reply-text')).toBeInViewport();
});
