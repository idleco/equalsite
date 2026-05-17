import { authorizationHeader } from "../config/http";

export async function safeCallbackUrlIsAlive(url: string): Promise<boolean> {
    try {
        await ensureCallbackUrlIsAlive(url);
        return true;
    } catch {
        return false;
    }
}

export async function ensureCallbackUrlIsAlive(
    url: string
): Promise<void> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { ...authorizationHeader },
    });

    if (!response.ok) {
        throw new Error("Callback URL is unavailable.");
    }
}
