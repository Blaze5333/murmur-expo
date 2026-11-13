import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import ffmpeg from 'ffmpeg-static';

const root = resolve(import.meta.dir, '..');
const output = resolve(root, 'public/demo');
const raw = resolve(root, 'artifacts/raw');
const framesDir = resolve(raw, 'frames');
const baseURL = process.env.DEMO_URL || 'http://127.0.0.1:4173';
await mkdir(output, { recursive: true });
await mkdir(framesDir, { recursive: true });

if (!ffmpeg) throw new Error('FFmpeg is unavailable on this platform.');
let preview: ReturnType<typeof Bun.spawn> | undefined;
try {
  await fetch(baseURL);
} catch {
  preview = Bun.spawn(['bun', 'scripts/serve.ts'], {
    cwd: root,
    stdout: 'inherit',
    stderr: 'inherit',
  });
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      await fetch(baseURL);
      break;
    } catch {
      await Bun.sleep(200);
    }
  }
}

const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' },
);
const errors: string[] = [];

async function encode(args: string[]) {
  const process = Bun.spawn(
    [ffmpeg!, '-hide_banner', '-loglevel', 'error', '-y', ...args],
    { stdout: 'inherit', stderr: 'inherit' },
  );
  if ((await process.exited) !== 0)
    throw new Error('FFmpeg conversion failed.');
}

try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('dialog', (dialog) => {
    void dialog.accept();
  });
  await page.goto(baseURL);
  await page.getByTestId('voice-button').waitFor();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: resolve(output, 'murmur-idle.png') });

  // CDP records the actual rendered browser frames, after fonts and entry motion settle.
  const client = await context.newCDPSession(page);
  const frames: { filename: string; time: number }[] = [];
  const writes: Promise<void>[] = [];
  client.on('Page.screencastFrame', (event) => {
    const filename = resolve(
      framesDir,
      `${String(frames.length).padStart(5, '0')}.jpg`,
    );
    frames.push({
      filename,
      time: event.metadata.timestamp ?? Date.now() / 1000,
    });
    writes.push(writeFile(filename, Buffer.from(event.data, 'base64')));
    void client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
  });
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 96,
    maxWidth: 780,
    maxHeight: 1688,
    everyNthFrame: 1,
  });
  await page.waitForTimeout(1200);
  await page.getByTestId('voice-button').click({ force: true });
  await page.waitForTimeout(2300);
  await page.screenshot({ path: resolve(output, 'murmur-listening.png') });
  await page.getByTestId('reply-text').waitFor({ timeout: 10_000 });
  await page.getByTestId('send-button').waitFor();
  await page.waitForTimeout(900);
  await page.getByTestId('message-input').fill('What if I get distracted?');
  await page.waitForTimeout(700);
  await page.getByTestId('send-button').click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="reply-text"]').length === 2,
  );
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(output, 'murmur-reply.png') });
  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(1200);
  await client.send('Page.stopScreencast');
  await Promise.all(writes);

  if (frames.length < 30)
    throw new Error(`Only ${frames.length} frames were captured.`);
  const manifest =
    frames
      .map((frame, index) => {
        const duration =
          index + 1 < frames.length
            ? Math.max(0.001, frames[index + 1].time - frame.time)
            : 1 / 30;
        return `file '${frame.filename}'\nduration ${duration.toFixed(6)}`;
      })
      .join('\n') + `\nfile '${frames[frames.length - 1].filename}'\n`;
  const manifestPath = resolve(raw, 'frames.txt');
  await writeFile(manifestPath, manifest);
  const mp4 = resolve(output, 'murmur-demo.mp4');
  await encode([
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    manifestPath,
    '-vf',
    'fps=30,scale=780:1688:flags=lanczos',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '19',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    mp4,
  ]);
  await encode([
    '-i',
    mp4,
    '-filter_complex',
    '[0:v]fps=15,scale=390:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a',
    '-loop',
    '0',
    resolve(output, 'murmur-demo.gif'),
  ]);

  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
    deviceScaleFactor: 1,
  });
  await desktop.goto(baseURL);
  await desktop.getByTestId('voice-button').waitFor();
  await desktop.waitForTimeout(1500);
  await desktop.screenshot({ path: resolve(output, 'murmur-desktop.png') });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    `Captured ${frames.length} real frames. MP4, GIF, and screenshots: ${output}`,
  );
  await rm(framesDir, { recursive: true, force: true });
} finally {
  await browser.close();
  preview?.kill();
}
