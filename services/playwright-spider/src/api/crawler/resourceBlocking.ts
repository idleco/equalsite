import { PlaywrightHook } from "crawlee";

export function setupResourceBlocking(): PlaywrightHook {
    return async ({ page }) => {
        await page.route('**/*', async (route) => {
            const request = route.request();
            const resourceType = request.resourceType();
            if ([
                'media',
                'font',
                'websocket',
                'manifest',
                'stylesheet',
            ].includes(resourceType)) {
                return await route.abort();
            }

            const url = request.url();
            if (
                url.includes('google-analytics') ||
                url.includes('doubleclick') ||
                url.includes('hotjar')
            ) {
                return await route.abort();
            }

            return await route.continue();
        });
    }
}
