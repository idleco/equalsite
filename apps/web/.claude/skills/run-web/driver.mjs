#!/usr/bin/env node
/**
 * Equalsite web driver
 *
 * Launches a headless Chrome session against http://localhost/, logs in,
 * then navigates to the requested URL and takes a screenshot.
 *
 * Uses Playwright from services/playwright-spider/node_modules/playwright
 * and the system Chrome at /usr/bin/google-chrome — no extra installs.
 *
 * Usage:
 *   node driver.mjs [--url <path>] [--out <dir>] [--name <slug>] [--no-login]
 *
 * Defaults:
 *   --url   /dashboard
 *   --out   /tmp/equalsite-shots
 *   --name  shot
 */

import { chromium } from '../../../../../services/playwright-spider/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
    options: {
        url:      { type: 'string',  default: '/dashboard' },
        out:      { type: 'string',  default: '/tmp/equalsite-shots' },
        name:     { type: 'string',  default: 'shot' },
        'no-login': { type: 'boolean', default: false },
        email:    { type: 'string',  default: 'skill@equalsite.test' },
        password: { type: 'string',  default: 'password' },
    },
    allowPositionals: false,
});

const BASE = 'http://localhost';
const SS_DIR = args.out;
fs.mkdirSync(SS_DIR, { recursive: true });

async function run() {
    const browser = await chromium.launch({
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        headless: true,
    });

    try {
        const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const page = await ctx.newPage();

        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        if (!args['no-login']) {
            await page.goto(`${BASE}/login`);
            await page.waitForSelector('form', { timeout: 15000 });
            await page.fill('input[name="email"]', args.email);
            await page.fill('input[name="password"]', args.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(`${BASE}/dashboard`, { timeout: 15000 });
            console.log('logged in as', args.email);
        }

        const target = args.url.startsWith('http') ? args.url : `${BASE}${args.url}`;
        await page.goto(target);
        await page.waitForTimeout(1500);

        const outFile = path.join(SS_DIR, `${args.name}.png`);
        await page.screenshot({ path: outFile, fullPage: false });
        console.log('screenshot:', outFile);
        console.log('url:', page.url());
        console.log('title:', await page.title());

        if (consoleErrors.length > 0) {
            console.warn('console errors:', consoleErrors.join('\n'));
        }
    } finally {
        await browser.close();
    }
}

run().catch(e => {
    console.error('FAILED:', e.message);
    process.exit(1);
});
