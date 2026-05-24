export function setupResourceBlocking() {
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
            if (url.includes('google-analytics') ||
                url.includes('doubleclick') ||
                url.includes('hotjar')) {
                return await route.abort();
            }
            return await route.continue();
        });
    };
}
//# sourceMappingURL=resourceBlocking.js.map