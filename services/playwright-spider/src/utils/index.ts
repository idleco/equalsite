export function sanitizeurl(urlString: string) {
    try {
        const url = new URL(urlString);
        url.hash = ''; // Remove #anchors
        const normalized = url.href.replace(/\/$/, ""); // Remove trailing slash
        return normalized;
    } catch {
        return null;
    }
}
