import { AUTH_HEADER } from "../../crawler/constants";

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

export async function ensureCallbackUrlReachable(
    callbackUrl: string
) {
    const isValid = await urlIsReachable(callbackUrl, {
        headers: AUTH_HEADER
    });

    if (! isValid) {
        throw new Error('Callback url is unreachable');
    }
}
