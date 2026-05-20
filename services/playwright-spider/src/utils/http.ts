
export function withAuthorization(
    headers?: Record<string, string>
): Record<string, string> {
    return {
        ...headers,
        Authorization: `Bearer ${process.env.CRAWLER_SECRET}`,
    }
}

export async function urlIsReachable(
    url: string,
    options: { headers: Record<string, string> }
): Promise<boolean> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { ...options.headers },
    });
    return Boolean(response.ok);
}
